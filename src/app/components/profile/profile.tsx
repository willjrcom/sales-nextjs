import { User } from "@/app/entities/user/user";
import React from "react";

type EmployeeUserProfileProps = {
    user?: User | null;
    photoUrl?: string;
};

const EmployeeUserProfile = ({ user, photoUrl }: EmployeeUserProfileProps) => {
    const getInitial = (name?: string) => name?.charAt(0).toUpperCase(); // Pega a primeira letra do nome

    return (
        <div className="relative">
            <div
                className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden shadow-md"
                title={user?.person.name}
            >
                {photoUrl ? (
                    <img
                        src={photoUrl}
                        alt={`${user?.person.name}'s profile`}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <span className="text-lg font-bold text-gray-600">{getInitial(user?.person.name)}</span>
                )}
            </div>
        </div>
    );
};

export default EmployeeUserProfile;
