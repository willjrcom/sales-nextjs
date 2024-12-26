import Employee from "@/app/entities/employee/employee";
import React from "react";

type EmployeeUserProfileProps = {
    employee?: Employee | null;
    photoUrl?: string;
};

const EmployeeUserProfile = ({ employee, photoUrl }: EmployeeUserProfileProps) => {
    const getInitial = (name?: string) => name?.charAt(0).toUpperCase(); // Pega a primeira letra do nome

    return (
        <div className="relative">
            <div
                className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden shadow-md"
                title={employee?.name}
            >
                {photoUrl ? (
                    <img
                        src={photoUrl}
                        alt={`${employee?.name}'s profile`}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <span className="text-lg font-bold text-gray-600">{getInitial(employee?.name)}</span>
                )}
            </div>
        </div>
    );
};

export default EmployeeUserProfile;
