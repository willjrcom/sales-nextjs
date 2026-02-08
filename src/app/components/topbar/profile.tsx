'use client';
import { useModal } from "@/app/context/modal/context";
import User from "@/app/entities/user/user";
import UserForm from "@/app/forms/user/form-profile";
import Image from "next/image";
import React, { useState } from "react";
import PasswordField from "@/app/components/modal/fields/password";
import UpdateUserPassword from "@/app/api/user/update/password/user";
import { notifySuccess, notifyError } from "@/app/utils/notifications";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import GetMeUser from "@/app/api/user/me/user";

const ChangePasswordModal = () => {
    const { data } = useSession();
    const modalHandler = useModal();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const { data: meUser } = useQuery({
        queryKey: ['me-user'],
        queryFn: async () => {
            return GetMeUser(data!);
        },
        enabled: !!data?.user?.access_token,
        refetchInterval: 30000,
    });

    return (
        <form
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
                if (!data) {
                    notifyError('Sessão inválida');
                    return;
                }

                if (!meUser?.email) {
                    notifyError('Email do usuário não disponível');
                    return;
                }

                setLoading(true);
                try {
                    await UpdateUserPassword({
                        email: meUser?.email,
                        current_password: currentPassword,
                        new_password: newPassword
                    }, data);
                    notifySuccess('Senha alterada com sucesso!');
                    modalHandler.hideModal("change-password");
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                } catch (err: any) {
                    notifyError(err?.message || 'Erro ao alterar senha');
                } finally {
                    setLoading(false);
                }
            }}
        >
            <PasswordField
                friendlyName="Senha Atual"
                name="currentPassword"
                placeholder="Digite sua senha atual"
                setValue={setCurrentPassword}
                value={currentPassword}
            />
            <PasswordField
                friendlyName="Nova Senha"
                name="newPassword"
                placeholder="Digite a nova senha"
                setValue={setNewPassword}
                value={newPassword}
                showStrengthIndicator={true}
                confirmPassword={confirmPassword}
                showConfirmValidation={true}
            />
            <PasswordField
                friendlyName="Confirmar Nova Senha"
                name="confirmPassword"
                placeholder="Confirme a nova senha"
                setValue={setConfirmPassword}
                value={confirmPassword}
                confirmPassword={newPassword}
                showConfirmValidation={false}
            />
            <div className="flex justify-end gap-2 mt-4">
                <button
                    type="button"
                    onClick={() => {
                        modalHandler.hideModal("change-password");
                        setCurrentPassword('');
                        setNewPassword('');
                        setConfirmPassword('');
                    }}
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
                >
                    {loading ? 'Salvando...' : 'Salvar'}
                </button>
            </div>
        </form>
    );
};

const EmployeeUserProfile = () => {
    const getInitial = (name?: string) => name?.charAt(0).toUpperCase(); // Pega a primeira letra do nome
    const modalHandler = useModal();
    const { data } = useSession();

    const { data: meUser } = useQuery({
        queryKey: ['me-user'],
        queryFn: async () => {
            return GetMeUser(data!);
        },
        enabled: !!data?.user?.access_token,
        refetchInterval: 30000,
    });

    const OpenModal = () => {
        const onClose = () => {
            modalHandler.hideModal("show-user")
        }

        modalHandler.showModal(
            "show-user",
            "Dados Pessoais",
            <>
                <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden shadow-md">
                    {meUser?.image_path ? (
                        <Image
                            src={meUser?.image_path}
                            alt={`${meUser?.name}'s profile`}
                            className="w-full h-full object-cover"
                            width={100}
                            height={100}
                        />
                    ) : (
                        <span className="text-lg font-bold text-gray-600">{getInitial(meUser?.name)}</span>
                    )}
                </div>
                <p className="mt-2 text-lg font-bold">{meUser?.name}</p>
                <hr className="my-4" />
                <UserForm />

                <hr className="my-4" />
                <button
                    onClick={() => {
                        const onClose = () => {
                            modalHandler.hideModal("change-password")
                        }
                        modalHandler.showModal("change-password", "Alterar Senha", <ChangePasswordModal />, "md", onClose)
                    }}
                    className="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                    Alterar Senha
                </button>
            </>,
            "md", onClose
        )
    }
    return (
        <>
            <div className="relative">
                <div onClick={OpenModal}
                    className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden shadow-md cursor-pointer"
                    title={meUser?.name}
                >
                    {meUser?.image_path ? (
                        <Image
                            src={meUser?.image_path}
                            alt={`${meUser?.name}'s profile`}
                            className="w-full h-full object-cover"
                            width={100}
                            height={100}
                        />
                    ) : (
                        <span className="text-lg font-bold text-gray-600">{getInitial(meUser?.name)}</span>
                    )}
                </div>
            </div>
        </>
    );
};

export default EmployeeUserProfile;
