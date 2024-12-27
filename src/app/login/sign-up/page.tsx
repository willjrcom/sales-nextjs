'use client';

import RequestError from '@/app/api/error';
import NewUser from '@/app/api/user/new/route';
import ErrorForms from '@/app/components/modal/error-forms';
import { TextField } from '@/app/components/modal/field';
import Person from '@/app/entities/person/person';
import User, { ValidateUserForm } from '@/app/entities/user/user';
import PersonForm from '@/app/forms/person/form';
import { ToIsoDate } from '@/app/utils/date';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const RegisterForm = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [user, setUser] = useState<Person>(new Person());
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const [error, setError] = useState<RequestError | null>(null);
    const router = useRouter();

    const submit = async () => {
        setError(null);

        if (password !== confirmPassword && password.length > 0) {
            setError(new RequestError('As senhas nao conferem'));
            return
        } else if (password.length < 8) {
            setError(new RequestError('A senha deve ter pelo menos 8 caracteres'));
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
            setError(null);
            setUser(new Person());
            router.push('/login');

        } catch (error) {
            setError(error as RequestError);
        }
    }

    return (
        <div className="flex h-screen">
            <div className="w-1/2 bg-yellow-500 relative">
                <Image src="/img_login.jpg" alt="Register" fill style={{ objectFit: 'cover' }} />
                <div className="absolute bottom-5 left-5 bg-black bg-opacity-50 p-5 rounded text-white">
                    <h2 className="text-2xl mb-2">GazalTech</h2>
                    <p>Crie sua conta agora mesmo.</p>
                </div>
            </div>
            <div className="w-1/2 h-5/6 flex flex-col items-center bg-white pt-10">
                <h2 className="text-2xl mb-6">Cadastro</h2>
                <div className="w-full max-w-md px-8 py-10 overflow-y-auto flex-1">
                    <div className="flex flex-col">
                        {error && <p className="mb-4 text-red-500">{error.message}</p>}
                        <ErrorForms errors={errors} />
                        <PersonForm person={user} setPerson={setUser} isEmployee />
                        <TextField friendlyName='Senha' name='password' placeholder='Digite sua senha' setValue={setPassword} value={password} />
                        <TextField friendlyName='Confirmar Senha' name='confirmPassword' placeholder='Confirme sua senha' setValue={setConfirmPassword} value={confirmPassword} />
                        {error && <p className="mb-4 text-red-500">{error.message}</p>}
                        <ErrorForms errors={errors} />
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