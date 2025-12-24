'use client';

import RequestError from '@/app/utils/error';
import NewUser from '@/app/api/user/new/user';
import ErrorForms from '@/app/components/modal/error-forms';
import PasswordField from '@/app/components/modal/fields/password';
import User, { ValidateUserForm } from '@/app/entities/user/user';
import { ToIsoDate } from '@/app/utils/date';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { notifyError, notifySuccess } from '@/app/utils/notifications';
import { DateField, ImageField, TextField } from '@/app/components/modal/field';
import PatternField from '@/app/components/modal/fields/pattern';
import AddressForm from '@/app/forms/address/form';
import ContactForm from '@/app/forms/contact/form';
import Contact from '@/app/entities/contact/contact';
import Address from '@/app/entities/address/address';

const RegisterForm = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [user, setUser] = useState<User>(new User());
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const router = useRouter();
    
    const [contact, setContact] = useState<Contact>(user.contact || new Contact({ id: undefined, object_id: undefined }))
    const [address, setAddress] = useState<Address>(user.address || new Address({ id: undefined, object_id: undefined }))

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
        if (password !== confirmPassword && password.length > 0) {
            notifyError('As senhas não conferem');
            return
        } else if (password.length < 8) {
            notifyError('A senha deve ter pelo menos 8 caracteres');
            return
        }

        if (user.birthday) {
            user.birthday = ToIsoDate(user.birthday)
        }

        const validationErrors = ValidateUserForm({ ...user } as User);
        if (Object.values(validationErrors).length > 0) return setErrors(validationErrors);

        try {
            await NewUser(user, password);
            setUser(new User());
            notifySuccess('Usuário cadastrado com sucesso!');
            router.push('/login');

        } catch (error: RequestError | any) {
            notifyError(error.message || "Erro ao cadastrar usuário");
        }
    }

    return (
        <div className="flex flex-col sm:flex-row h-screen">
            <div className="w-full sm:w-1/2 bg-yellow-500 relative min-h-[40vh] sm:min-h-screen">
                <Image
                    src="/icons/logo.png"
                    alt="Logo Image"
                    fill
                    style={{ objectFit: 'cover', objectPosition: 'center' }}
                    unoptimized
                    priority
                />

                <div className="absolute bottom-5 left-5 bg-black bg-opacity-50 p-5 rounded text-white z-10 hidden sm:block">
                    <h2 className="text-2xl mb-2">GazalTech</h2>
                    <p>Crie sua conta agora mesmo.</p>
                </div>
            </div>
            <div className="w-full sm:w-1/2 h-screen flex flex-col items-center bg-white pt-10">
                <h2 className="text-2xl mb-6">Cadastro</h2>
                <div className="w-full max-w-md px-8 py-10 overflow-y-auto flex-1">
                    <div className="flex flex-col">
                        <ErrorForms errors={errors} setErrors={setErrors} />
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
                                <AddressForm addressParent={user.address} setAddressParent={setAddress} />
                            </div>

                            {/* Seção: Dados Adicionais */}
                            <div className="bg-gradient-to-br from-white to-purple-50 rounded-lg shadow-sm border border-purple-100 p-6 transition-all duration-300 hover:shadow-md">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-purple-200">Dados Adicionais</h3>
                                <div className="space-y-4">

                                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-4">
                                        <div className="flex-1 transform transition-transform duration-200 hover:scale-[1.01]">
                                            <TextField name="email" friendlyName="Email" placeholder="Digite seu e-mail" setValue={value => handleInputChange('email', value)} value={user.email} />

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
                                            <PatternField patternName="cpf" name="cpf" friendlyName="CPF" placeholder="Digite seu cpf" setValue={value => handleInputChange('cpf', value)} value={user.cpf || ''} formatted={true} />
                                        </div>
                                        <div className="flex-1 transform transition-transform duration-200 hover:scale-[1.01]">
                                            <DateField name="birthday" friendlyName="Nascimento" setValue={value => handleInputChange('birthday', value)} value={user.birthday} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>

                        <PasswordField
                            friendlyName='Senha'
                            name='password'
                            placeholder='Digite sua senha'
                            setValue={setPassword}
                            value={password}
                            showStrengthIndicator={true}
                            confirmPassword={confirmPassword}
                            showConfirmValidation={true}
                        />
                        <PasswordField
                            friendlyName='Confirmar Senha'
                            name='confirmPassword'
                            placeholder='Confirme sua senha'
                            setValue={setConfirmPassword}
                            value={confirmPassword}
                            confirmPassword={password}
                            showConfirmValidation={false}
                        />
                    </div>
                </div>
                <div className="w-full max-w-md px-8 py-4 bg-white">
                    <button onClick={submit} className="w-full py-3 bg-yellow-500 text-white rounded hover:bg-yellow-600">Cadastrar</button>
                    <div className="flex justify-between mt-4 text-yellow-500">
                        <Link href="/login" className="hover:underline">Já tem conta? Faça login</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterForm;
