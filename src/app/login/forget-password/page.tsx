'use client';

import RequestError from '@/app/utils/error';
import ForgetUserPassword from '@/app/api/user/forget-password/user';
import { TextField } from '@/app/components/modal/field';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { notifyError, notifySuccess } from '@/app/utils/notifications';
import { HiOutlineMail, HiOutlineCheckCircle } from "react-icons/hi";
import ValidatePasswordResetToken from '@/app/api/user/validate-password-reset-token';
import PasswordField from '@/app/components/modal/fields/password';
import UpdateUserForgetPassword from '@/app/api/user/update/forget-password/user';

const RegisterForm = () => {
    const [email, setEmail] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const [jwtToken, setJwtToken] = useState('');
    const [jwtResult, setJwtResult] = useState<{ valid: boolean; email?: string; error?: string } | null>(null);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const submit = async () => {
        try {
            await ForgetUserPassword(email);
            setIsSuccess(true);
            notifySuccess('Email de redefinição enviado com sucesso!');

        } catch (error: RequestError | any) {
            notifyError(error.message || "Erro ao enviar email de redefinição");
        }
    }

    if (isSuccess) {
        return (
            <div className="flex h-screen">
                <div className="w-1/2 bg-yellow-500 relative">
                    <Image src="/img_login.jpg" alt="Register" fill style={{ objectFit: 'cover' }} />
                    <div className="absolute bottom-5 left-5 bg-black bg-opacity-50 p-5 rounded text-white">
                        <h2 className="text-2xl mb-2">GazalTech</h2>
                        <p>Verifique sua caixa de entrada.</p>
                    </div>
                </div>
                <div className="w-1/2 flex flex-col items-center justify-center bg-white">
                    <div className="text-center max-w-md px-8">
                        <div className="bg-green-100 text-green-600 rounded-full p-4 mb-6 mx-auto w-20 h-20 flex items-center justify-center">
                            <HiOutlineCheckCircle size={40} />
                        </div>
                        <h2 className="text-2xl mb-4 font-bold text-gray-800">Email Enviado!</h2>
                        <p className="text-gray-600 mb-6">
                            Enviamos um email para <strong>{email}</strong> com instruções para redefinir sua senha.
                        </p>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                            <div className="flex items-center gap-3">
                                <HiOutlineMail className="text-blue-600" size={20} />
                                <p className="text-blue-800 text-sm">
                                    Verifique sua caixa de entrada e também a pasta de spam
                                </p>
                            </div>
                        </div>
                        <div className="mb-4">
                            <TextField
                                friendlyName="Código de redefinição (JWT)"
                                name="jwt"
                                placeholder="Cole aqui o código enviado por e-mail"
                                setValue={setJwtToken}
                                value={jwtToken}
                            />
                            <button
                                className="w-full py-2 mt-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                onClick={async () => {
                                    setJwtResult(null);
                                    try {
                                        console.log("validate")
                                        const res = await ValidatePasswordResetToken(jwtToken);
                                        setJwtResult(res);
                                    } catch (err: any) {
                                        setJwtResult({ valid: false, error: err?.message || 'Erro ao validar token' });
                                    }
                                }}
                                disabled={!jwtToken}
                            >
                                Validar
                            </button>
                            {jwtResult && (
                                <div className={`mt-2 text-sm ${jwtResult.valid ? 'text-green-600' : 'text-red-600'}`}>
                                    {jwtResult.valid
                                        ? <>
                                            Token válido! E-mail: {jwtResult.email}
                                            <button
                                                className="block mt-2 w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                                                onClick={() => setShowPasswordModal(true)}
                                            >
                                                Redefinir Senha
                                            </button>
                                        </>
                                        : `Token inválido: ${jwtResult.error}`}
                                </div>
                            )}
                        </div>
                        {showPasswordModal && (
                            <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                                <form
                                    className="bg-white p-6 rounded shadow-lg w-full max-w-md"
                                    onSubmit={async (e) => {
                                        e.preventDefault();
                                        if (newPassword !== confirmPassword) {
                                            notifyError('As senhas não conferem');
                                            return;
                                        }
                                        if (newPassword.length < 8) {
                                            notifyError('A senha deve ter pelo menos 8 caracteres');
                                            return;
                                        }
                                        setLoading(true);
                                        try {
                                            await UpdateUserForgetPassword({email: email, password: newPassword, token: jwtToken})
                                            notifySuccess('Senha redefinida com sucesso!');
                                            setShowPasswordModal(false);
                                            router.push('/login');
                                        } catch (err: any) {
                                            notifyError(err?.message || 'Erro ao redefinir senha');
                                        } finally {
                                            setLoading(false);
                                        }
                                    }}
                                >
                                    <h2 className="text-xl font-bold mb-4">Redefinir Senha</h2>
                                    <PasswordField
                                        friendlyName="Nova Senha"
                                        name="newPassword"
                                        placeholder="Digite a nova senha"
                                        setValue={setNewPassword}
                                        value={newPassword}
                                        showStrengthIndicator={true}
                                    />
                                    <PasswordField
                                        friendlyName="Confirmar Nova Senha"
                                        name="confirmPassword"
                                        placeholder="Confirme a nova senha"
                                        setValue={setConfirmPassword}
                                        value={confirmPassword}
                                    />
                                    <div className="flex justify-end gap-2 mt-4">
                                        <button type="button" onClick={() => setShowPasswordModal(false)} className="px-4 py-2 bg-gray-200 rounded">Cancelar</button>
                                        <button type="submit" disabled={loading} className="px-4 py-2 bg-green-600 text-white rounded">{loading ? 'Salvando...' : 'Salvar'}</button>
                                    </div>
                                </form>
                            </div>
                        )}
                        <Link 
                            href="/login" 
                            className="inline-block w-full py-3 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
                        >
                            Voltar ao Login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen">
            <div className="w-1/2 bg-yellow-500 relative">
                <Image src="/img_login.jpg" alt="Register" fill style={{ objectFit: 'cover' }} />
                <div className="absolute bottom-5 left-5 bg-black bg-opacity-50 p-5 rounded text-white">
                    <h2 className="text-2xl mb-2">GazalTech</h2>
                    <p>Redefina sua senha.</p>
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
