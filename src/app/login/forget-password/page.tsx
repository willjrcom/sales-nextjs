'use client';

import RequestError from '@/app/utils/error';
import ForgetUserPassword from '@/app/api/user/forget-password/user';
import { TextField } from '@/app/components/modal/field';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { notifyError } from '@/app/utils/notifications';

const RegisterForm = () => {
    const [email, setEmail] = useState('');
    const router = useRouter();

    const submit = async () => {
        try {
            await ForgetUserPassword(email);
            setEmail('');
            router.push('/login');

        } catch (error: RequestError | any) {
            notifyError(error.message || "Erro ao alterar senha");
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
            <div className="w-1/2 flex flex-col items-center bg-white pt-10">
                <h2 className="text-2xl mb-6">Esqueci minha senha</h2>
                <div className="w-full max-w-md px-8 py-10 overflow-y-auto ">
                    <div className="flex flex-col">
                        <TextField friendlyName='E-mail' name='email' placeholder='Digite seu e-mail' setValue={setEmail} value={email} />
                    </div>
                </div>

                <div className="w-full max-w-md px-8 py-4 bg-white">
                    <button onClick={submit} className="w-full py-3 bg-yellow-500 text-white rounded hover:bg-yellow-600">Enviar nova senha</button>
                    <div className="flex justify-between mt-4 text-yellow-500">
                        <Link href="/login" className="hover:underline">Lembrou sua senha? Faça login</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterForm;
