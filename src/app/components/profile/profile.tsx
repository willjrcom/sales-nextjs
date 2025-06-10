 'use client';
import { useModal } from "@/app/context/modal/context";
import User from "@/app/entities/user/user";
import UserForm from "@/app/forms/user/form-profile";
import React from "react";

type EmployeeUserProfileProps = {
    user: User;
    photoUrl?: string;
};

const EmployeeUserProfile = ({ user, photoUrl }: EmployeeUserProfileProps) => {
    const getInitial = (name?: string) => name?.charAt(0).toUpperCase(); // Pega a primeira letra do nome
    const modalHandler = useModal();

    const OpenModal = () => {
        const onClose = () => {
            modalHandler.hideModal("show-user")
        }
        
        modalHandler.showModal(
            "show-user",
            "Dados Pessoais",
            <>
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden shadow-md">
                    {photoUrl ? (
                        <img
                            src={photoUrl}
                            alt={`${user.name}'s profile`}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <span className="text-lg font-bold text-gray-600">{getInitial(user.name)}</span>
                    )}
                </div>
                <p className="mt-2 text-lg font-bold">{user.name}</p>
                <hr className="my-4" />
                <UserForm item={user} />
            </>,
            "md", onClose
        )
    }
    return (
        <div className="relative">
            <div onClick={OpenModal}
                className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden shadow-md cursor-pointer"
                title={user.name}
            >
                {photoUrl ? (
                    <img
                        src={photoUrl}
                        alt={`${user.name}'s profile`}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <span className="text-lg font-bold text-gray-600">{getInitial(user.name)}</span>
                )}
            </div>
        </div>
    );
};

export default EmployeeUserProfile;
