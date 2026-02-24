'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import RequestError from '@/app/utils/error';
import NewUser from '@/app/api/user/new/user';
import PasswordField from '@/app/components/modal/fields/password';
import User, { SchemaSignUp, SignUpFormData } from '@/app/entities/user/user';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { notifyError, notifySuccess } from '@/app/utils/notifications';
import { TextField } from '@/app/components/modal/field';
import PatternField from '@/app/components/modal/fields/pattern';

const RegisterForm = () => {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors }
    } = useForm<SignUpFormData>({
        resolver: zodResolver(SchemaSignUp),
        defaultValues: {
            name: '',
            email: '',
            cpf: '',
            password: '',
            confirmPassword: '',
        }
    });

    const formData = watch();

    const onInvalid = () => {
        notifyError('Verifique os campos obrigatórios');
    };

    const submit = async (data: SignUpFormData) => {
        setIsSaving(true);
        try {
            const userToCreate = new User({
                name: data.name,
                email: data.email,
                cpf: data.cpf,
            });
            await NewUser(userToCreate, data.password);
            notifySuccess('Usuário cadastrado com sucesso!');
            router.push('/login');
        } catch (error: RequestError | any) {
            notifyError(error.message || "Erro ao cadastrar usuário");
        } finally {
            setIsSaving(false);
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
                <h2 className="text-2xl mb-6 font-bold text-gray-800">Cadastro</h2>
                <div className="w-full max-w-md px-8 py-10 overflow-y-auto flex-1">
                    <div className="flex flex-col">
                        <div className="text-black space-y-6">
                            <div className="bg-gradient-to-br from-white to-gray-50 rounded-lg shadow-sm border border-gray-100 p-6 transition-all duration-300 hover:shadow-md">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Informações Básicas</h3>

                                <TextField
                                    name="name"
                                    friendlyName="Nome"
                                    placeholder="Digite seu nome"
                                    setValue={value => setValue('name', value)}
                                    value={formData.name}
                                    error={errors.name?.message}
                                />

                                <TextField
                                    name="email"
                                    friendlyName="Email"
                                    placeholder="Digite seu e-mail"
                                    setValue={value => setValue('email', value)}
                                    value={formData.email}
                                    error={errors.email?.message}
                                />

                                <PatternField
                                    patternName="cpf"
                                    name="cpf"
                                    friendlyName="CPF"
                                    placeholder="Digite seu cpf"
                                    setValue={value => setValue('cpf', value)}
                                    value={formData.cpf}
                                    formatted={true}
                                    error={errors.cpf?.message}
                                />

                                <PasswordField
                                    friendlyName='Senha'
                                    name='password'
                                    placeholder='Digite sua senha'
                                    setValue={value => setValue('password', value)}
                                    value={formData.password}
                                    showStrengthIndicator={true}
                                    confirmPassword={formData.confirmPassword}
                                    showConfirmValidation={true}
                                    error={errors.password?.message}
                                />
                                <PasswordField
                                    friendlyName='Confirmar Senha'
                                    name='confirmPassword'
                                    placeholder='Confirme sua senha'
                                    setValue={value => setValue('confirmPassword', value)}
                                    value={formData.confirmPassword}
                                    confirmPassword={formData.password}
                                    showConfirmValidation={false}
                                    error={errors.confirmPassword?.message}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="w-full max-w-md px-8 py-4 bg-white border-t border-gray-100">
                    <button
                        onClick={handleSubmit(submit, onInvalid)}
                        disabled={isSaving}
                        className={`w-full py-3 bg-yellow-500 text-white rounded font-bold transition-colors ${isSaving ? 'opacity-50 cursor-not-allowed' : 'hover:bg-yellow-600'}`}
                    >
                        {isSaving ? 'Cadastrando...' : 'Cadastrar'}
                    </button>
                    <div className="flex justify-center mt-4 text-yellow-500">
                        <Link href="/login" className="hover:underline font-medium">Já tem conta? Faça login</Link>
                    </div>
                </div>
            </div>
            <Link href="/home" className="fixed bottom-6 right-6 z-50 px-6 py-3 bg-white/90 backdrop-blur shadow-lg rounded-full font-bold text-brand-dark hover:scale-105 hover:shadow-xl transition-all flex items-center gap-2 group">
                <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform">arrow_back</span>
                Voltar para home
            </Link>
        </div>
    );
};

export default RegisterForm;
