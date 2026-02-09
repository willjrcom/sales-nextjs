"use client";

import React, { createContext, useContext } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import Employee from "@/app/entities/employee/employee";
import GetMeEmployee from "@/app/api/employee/me/employee";

interface UserContextType {
    user: Employee | undefined;
    isLoading: boolean;
    hasPermission: (key: string) => boolean;
}

const UserContext = createContext<UserContextType>({
    user: undefined,
    isLoading: true,
    hasPermission: () => false,
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
    const { data: session } = useSession();

    const { data: employee, isLoading } = useQuery({
        queryKey: ['me-employee'],
        queryFn: () => GetMeEmployee(session!),
        enabled: !!session?.user?.access_token,
    });

    const hasPermission = (key: string): boolean => {
        if (!employee) return false;
        // Se for admin ou dono, talvez tenha todas? Por enquanto segue a logica do objeto permissions
        // Se a permissão não existe no objeto, assume false
        return !!employee.permissions[key];
    };

    return (
        <UserContext.Provider value={{ user: employee, isLoading, hasPermission }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
