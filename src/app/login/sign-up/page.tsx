'use client';

import RequestError from '@/app/utils/error';
import NewUser from '@/app/api/user/new/user';
import ErrorForms from '@/app/components/modal/error-forms';
import PasswordField from '@/app/components/modal/fields/password';
import Person from '@/app/entities/person/person';
import User, { ValidateUserForm } from '@/app/entities/user/user';
import PersonForm from '@/app/forms/person/form';
import { ToIsoDate } from '@/app/utils/date';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { notifyError, notifySuccess } from '@/app/utils/notifications';

const RegisterForm = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [user, setUser] = useState<Person>(new Person());
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const router = useRouter();
    // Sempre renderiza para evitar problemas de hidratação
    // O estado inicial já está configurado corretamente
    
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

        user.address.id = undefined;
        user.contact.id = undefined;
        user.contact.object_id = undefined;
        user.address.object_id = undefined;
        try {
            await NewUser({ ...user } as User, password);
            setUser(new Person());
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
                        <PersonForm person={user} setPerson={setUser} isEmployee />
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
