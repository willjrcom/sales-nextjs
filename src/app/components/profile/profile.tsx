import { useModal } from "@/app/context/modal/context";
import Person from "@/app/entities/person/person";
import UserForm from "@/app/forms/user/form";
import React from "react";

interface UserSession {
    person: Person;
}

type EmployeeUserProfileProps = {
    user: UserSession;
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
                            alt={`${user.person.name}'s profile`}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <span className="text-lg font-bold text-gray-600">{getInitial(user.person.name)}</span>
                    )}
                </div>
                <p className="mt-2 text-lg font-bold">{user.person.name}</p>
                <hr className="my-4" />
                <UserForm item={user.person} />
            </>,
            "sm", onClose
        )
    }
    return (
        <div className="relative">
            <div onClick={OpenModal}
                className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden shadow-md cursor-pointer"
                title={user.person.name}
            >
                {photoUrl ? (
                    <img
                        src={photoUrl}
                        alt={`${user.person.name}'s profile`}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <span className="text-lg font-bold text-gray-600">{getInitial(user.person.name)}</span>
                )}
            </div>
        </div>
    );
};

export default EmployeeUserProfile;
