import React, { useCallback, useEffect, useState } from 'react';
import User, { ValidateUserForm } from '@/app/entities/user/user';
import { useSession } from 'next-auth/react';
import ButtonsModal from '../../components/modal/buttons-modal';
import CreateFormsProps from '../create-forms-props';
import UpdateUser from '@/app/api/user/update/user';
import { notifySuccess, notifyError } from '@/app/utils/notifications';
import { useModal } from '@/app/context/modal/context';
import ErrorForms from '../../components/modal/error-forms';
import RequestError from '@/app/utils/error';
import { ToIsoDate, ToUtcDate } from '@/app/utils/date';
import { ImageField, TextField } from '@/app/components/modal/field';
import PatternField from '@/app/components/modal/fields/pattern';
import AddressForm from '../address/form';
import ContactForm from '../contact/form';
import Address from '@/app/entities/address/address';
import Contact from '@/app/entities/contact/contact';

const UserForm = ({ item, setItem }: CreateFormsProps<User>) => {
    const modalName = 'show-user'
    const modalHandler = useModal();
    const [user, setUser] = useState<User>(() => {
        const u = new User(item);
        if (u.birthday) u.birthday = ToUtcDate(u.birthday);
        return u;
    });
    const [contact, setContact] = useState<Contact>(new Contact(user.contact))
    const [address, setAddress] = useState<Address>(new Address(user.address))
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const { data } = useSession();

    const handleInputChange = useCallback((field: keyof User, value: any) => {
        setUser(prev => ({
            ...prev,
            [field]: value
        }));
    }, [setUser]);

    useEffect(() => {
        handleInputChange('address', address);
    }, [address]);

    useEffect(() => {
        handleInputChange('contact', contact);
    }, [contact]);

    const submit = async () => {
        if (!data) return;

        let newUser: User = { ...user }

        if (newUser.birthday) {
            newUser.birthday = ToIsoDate(newUser.birthday)
        }

        const validationErrors = ValidateUserForm(newUser);
        if (Object.values(validationErrors).length > 0) return setErrors(validationErrors);

        try {
            await UpdateUser(newUser, data)
            setUser(newUser);
            if (setItem) setItem(newUser); // update parent state if setter provided
            notifySuccess('Perfil atualizado com sucesso');
            modalHandler.hideModal(modalName);
        } catch (error) {
            const err = error as RequestError;
            notifyError(err.message || 'Erro ao atualizar perfil');
        }
    }

    return (
        <div className="text-black space-y-6">
            {/* Seção: Informações Básicas */}
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-lg shadow-sm border border-gray-100 p-6 transition-all duration-300 hover:shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Informações Básicas</h3>
                <TextField name="name" friendlyName="Nome" placeholder="Digite seu nome" setValue={value => handleInputChange('name', value)} value={user.name} />
            </div>

            {/* Seção: Contato */}
            <div className="bg-gradient-to-br from-white to-blue-50 rounded-lg shadow-sm border border-blue-100 p-6 transition-all duration-300 hover:shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-blue-200">Contato</h3>
                <ContactForm contactParent={contact} setContactParent={setContact} />
            </div>

            {/* Seção: Endereço */}
            <div className="bg-gradient-to-br from-white to-green-50 rounded-lg shadow-sm border border-green-100 p-6 transition-all duration-300 hover:shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-green-200">Endereço</h3>
                <AddressForm addressParent={address} setAddressParent={setAddress} />
            </div>

            {/* Seção: Dados Adicionais */}
            <div className="bg-gradient-to-br from-white to-purple-50 rounded-lg shadow-sm border border-purple-100 p-6 transition-all duration-300 hover:shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-purple-200">Dados Adicionais</h3>
                <div className="space-y-4">

                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-4">
                        <div className="flex-1 transform transition-transform duration-200 hover:scale-[1.01]">
                            <TextField name="email" friendlyName="Email" placeholder="Digite seu e-mail" setValue={value => handleInputChange('email', value)} value={user.email} optional={false} />

                        </div>
                        <div className="flex-1 transform transition-transform duration-200 hover:scale-[1.01]">
                            <ImageField
                                friendlyName='Imagem'
                                name='image_path'
                                setValue={value => handleInputChange('image_path', value)}
                                value={user.image_path}
                                optional
                                onUploadError={(error) => notifyError(error)}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-4">
                        <div className="flex-1 transform transition-transform duration-200 hover:scale-[1.01]">
                            <PatternField patternName="cpf" name="cpf" friendlyName="CPF" placeholder="Digite seu cpf" setValue={value => handleInputChange('cpf', value)} value={user.cpf || ''} optional={false} formatted={true} />
                        </div>
                        <div className="flex-1 transform transition-transform duration-200 hover:scale-[1.01]">
                            <PatternField patternName="date" name="birthday" friendlyName="Nascimento" setValue={value => handleInputChange('birthday', value)} value={user.birthday || ''} optional={false} formatted={true} />
                        </div>
                    </div>
                </div>
            </div>

            <ErrorForms errors={errors} setErrors={setErrors} />
            <ButtonsModal item={user} name="Usuário" onSubmit={submit} />
        </div>
    );
};

export default UserForm;