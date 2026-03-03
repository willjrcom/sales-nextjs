import React, { useMemo, useState } from 'react';
import User, { SchemaUser, UserFormData } from '@/app/entities/user/user';
import { useSession } from 'next-auth/react';
import ButtonsModal from '../../components/modal/buttons-modal';
import CreateFormsProps from '../create-forms-props';
import UpdateUser from '@/app/api/user/update/user';
import { notifySuccess, notifyError } from '@/app/utils/notifications';
import { useModal } from '@/app/context/modal/context';
import RequestError from '@/app/utils/error';
import { ToIsoDate, ToUtcDate } from '@/app/utils/date';
import { ImageField, SelectField, TextField } from '@/app/components/modal/field';
import PatternField from '@/app/components/modal/fields/pattern';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import GetAddressByCEP from '@/app/api/busca-cep/busca-cep';
import { FaSearch } from 'react-icons/fa';
import { addressUFsWithId } from '@/app/entities/address/utils';

const UserForm = ({ item }: CreateFormsProps<User>) => {
    const modalName = 'show-user'
    const modalHandler = useModal();
    const { data: session } = useSession();
    const queryClient = useQueryClient();
    const [loadingCep, setLoadingCep] = useState(false);

    const initialData = useMemo(() => {
        const u = new User(item);
        if (u.birthday) u.birthday = ToUtcDate(u.birthday);
        return u;
    }, [item]);

    const {
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isSubmitting }
    } = useForm<UserFormData>({
        resolver: zodResolver(SchemaUser),
        defaultValues: {
            name: initialData.name,
            email: initialData.email,
            cpf: initialData.cpf,
            birthday: initialData.birthday || '',
            contact: initialData.contact.number,
            cep: initialData.address.cep,
            street: initialData.address.street,
            number: initialData.address.number,
            neighborhood: initialData.address.neighborhood,
            complement: initialData.address.complement,
            reference: initialData.address.reference,
            city: initialData.address.city,
            uf: initialData.address.uf,
            image_path: initialData.image_path,
        }
    });

    const submit = async (formData: UserFormData) => {
        if (!session) return;

        const userToSave = new User(initialData);
        Object.assign(userToSave, {
            ...formData,
            contact: { ...initialData.contact, number: formData.contact },
            address: {
                ...initialData.address,
                street: formData.street,
                number: formData.number,
                neighborhood: formData.neighborhood,
                complement: formData.complement,
                reference: formData.reference,
                city: formData.city,
                uf: formData.uf,
                cep: formData.cep
            }
        });

        if (userToSave.birthday) {
            userToSave.birthday = ToIsoDate(userToSave.birthday)
        } else {
            delete userToSave.birthday;
        }

        try {
            await UpdateUser(userToSave, session)
            queryClient.invalidateQueries({ queryKey: ['me-user'] });
            queryClient.invalidateQueries({ queryKey: ['me-employee'] });
            notifySuccess('Perfil atualizado com sucesso');
            modalHandler.hideModal(modalName);
        } catch (error) {
            const err = error as RequestError;
            notifyError(err.message || 'Erro ao atualizar perfil');
        }
    }

    const onInvalid = () => {
        console.log(errors);
        notifyError('Formulário inválido. Verifique os campos obrigatórios.');
    }

    const getAddress = async () => {
        const cep = watch('cep');
        if (!cep) return;

        setLoadingCep(true);
        try {
            const addressFound = await GetAddressByCEP(cep);
            if (addressFound && addressFound.logradouro) {
                setValue('street', addressFound.logradouro);
                setValue('neighborhood', addressFound.bairro);
                setValue('city', addressFound.localidade);
                setValue('uf', addressFound.uf);
            }
        } catch (error) {
            notifyError('Erro ao buscar CEP');
        } finally {
            setLoadingCep(false);
        }
    }

    return (
        <div className="text-black space-y-6">
            {/* Seção: Informações Básicas */}
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-lg shadow-sm border border-gray-100 p-6 transition-all duration-300 hover:shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Informações Básicas</h3>
                <TextField
                    name="name"
                    friendlyName="Nome"
                    placeholder="Digite seu nome"
                    setValue={(value: any) => setValue('name', value)}
                    value={watch('name') || ''}
                    error={errors.name?.message}
                />
            </div>

            {/* Seção: Contato */}
            <div className="bg-gradient-to-br from-white to-blue-50 rounded-lg shadow-sm border border-blue-100 p-6 transition-all duration-300 hover:shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-blue-200">Contato</h3>
                <div className="transform transition-transform duration-200 hover:scale-[1.01]">
                    <PatternField
                        patternName='full-phone'
                        name="contact"
                        friendlyName="Celular"
                        placeholder="xx xxxx-xxxx"
                        setValue={(value: any) => setValue('contact', value)}
                        value={watch('contact') || ''}
                        error={errors.contact?.message}
                    />
                </div>
            </div>

            {/* Seção: Endereço */}
            <div className="bg-gradient-to-br from-white to-green-50 rounded-lg shadow-sm border border-green-100 p-6 transition-all duration-300 hover:shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-green-200">Endereço</h3>

                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4 items-end">
                        <div className="flex-1 transform transition-transform duration-200 hover:scale-[1.01]">
                            <PatternField
                                patternName='cep'
                                name="cep"
                                friendlyName="Cep"
                                placeholder="00000-000"
                                setValue={(value: any) => setValue('cep', value)}
                                value={watch('cep') || ''}
                                formatted={true}
                                error={errors.cep?.message}
                            />
                        </div>
                        <button
                            type="button"
                            className='flex items-center justify-center space-x-2 p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md disabled:bg-gray-400'
                            onClick={getAddress}
                            disabled={loadingCep}
                        >
                            <FaSearch />&nbsp;<span>{loadingCep ? 'Buscando...' : 'Buscar'}</span>
                        </button>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 sm:flex-[2] transform transition-transform duration-200 hover:scale-[1.01]">
                            <TextField
                                name="street"
                                friendlyName="Rua"
                                placeholder="Digite sua rua"
                                setValue={(value: any) => setValue('street', value)}
                                value={watch('street') || ''}
                                error={errors.street?.message}
                            />
                        </div>
                        <div className="flex-1 transform transition-transform duration-200 hover:scale-[1.01]">
                            <TextField
                                name="number"
                                friendlyName="Numero"
                                placeholder="Digite o numero"
                                setValue={(value: any) => setValue('number', value)}
                                value={watch('number') || ''}
                                error={errors.number?.message}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 transform transition-transform duration-200 hover:scale-[1.01]">
                            <TextField
                                name="neighborhood"
                                friendlyName="Bairro"
                                placeholder="Digite o bairro"
                                setValue={(value: any) => setValue('neighborhood', value)}
                                value={watch('neighborhood') || ''}
                                error={errors.neighborhood?.message}
                            />
                        </div>
                        <div className="flex-1 transform transition-transform duration-200 hover:scale-[1.01]">
                            <TextField
                                name="complement"
                                friendlyName="Complemento"
                                placeholder="Digite o complemento"
                                setValue={(value: any) => setValue('complement', value)}
                                value={watch('complement') || ''}
                                optional
                                error={errors.complement?.message}
                            />
                        </div>
                    </div>

                    <div className="transform transition-transform duration-200 hover:scale-[1.01]">
                        <TextField
                            name="reference"
                            friendlyName="Referência"
                            placeholder="Digite a referência"
                            setValue={(value: any) => setValue('reference', value)}
                            value={watch('reference') || ''}
                            optional
                            error={errors.reference?.message}
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 sm:flex-[2] transform transition-transform duration-200 hover:scale-[1.01]">
                            <TextField
                                name="city"
                                friendlyName="Cidade"
                                placeholder="Digite a cidade"
                                setValue={(value: any) => setValue('city', value)}
                                value={watch('city') || ''}
                                error={errors.city?.message}
                            />
                        </div>
                        <div className="flex-1 transform transition-transform duration-200 hover:scale-[1.01]">
                            <SelectField
                                name="uf"
                                friendlyName="Estado"
                                setSelectedValue={(value: any) => setValue('uf', value)}
                                selectedValue={watch('uf') || ''}
                                values={addressUFsWithId}
                            />
                            {errors.uf && <p className="text-red-500 text-xs italic mt-1">{errors.uf.message}</p>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Seção: Dados Obrigatórios */}
            <div className="bg-gradient-to-br from-white to-purple-50 rounded-lg shadow-sm border border-purple-100 p-6 transition-all duration-300 hover:shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-purple-200">Dados Obrigatórios</h3>
                <div className="space-y-4">

                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-4">
                        <div className="flex-1 transform transition-transform duration-200 hover:scale-[1.01]">
                            <TextField
                                name="email"
                                friendlyName="Email"
                                placeholder="Digite seu e-mail"
                                setValue={(value: any) => setValue('email', value)}
                                value={watch('email') || ''}
                                optional={false}
                                error={errors.email?.message}
                            />
                        </div>
                        <div className="flex-1 transform transition-transform duration-200 hover:scale-[1.01]">
                            <ImageField
                                friendlyName='Imagem'
                                name='image_path'
                                setValue={(value: any) => setValue('image_path', value)}
                                value={watch('image_path') || ''}
                                optional
                                onUploadError={(error) => notifyError(error)}
                                error={errors.image_path?.message}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-4">
                        <div className="flex-1 transform transition-transform duration-200 hover:scale-[1.01]">
                            <PatternField
                                patternName="cpf"
                                name="cpf"
                                friendlyName="CPF"
                                placeholder="Digite seu cpf"
                                setValue={(value: any) => setValue('cpf', value)}
                                value={watch('cpf') || ''}
                                optional={false}
                                formatted={true}
                                error={errors.cpf?.message}
                            />
                        </div>
                        <div className="flex-1 transform transition-transform duration-200 hover:scale-[1.01]">
                            <PatternField
                                patternName="date"
                                name="birthday"
                                friendlyName="Nascimento"
                                setValue={(value: any) => setValue('birthday', value)}
                                value={watch('birthday') || ''}
                                optional={false}
                                formatted={true}
                                error={errors.birthday?.message}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <ButtonsModal item={initialData} name="Usuário" onSubmit={handleSubmit(submit, onInvalid)} isPending={isSubmitting} />
        </div>
    );
};

export default UserForm;