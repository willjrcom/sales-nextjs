"use client";
import React, { createContext, useContext, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import Employee from "@/app/entities/employee/employee";
import GetMeEmployee from "@/app/api/employee/me/employee";
import printService from "@/app/utils/print-service";
import GetCompany from '@/app/api/company/company';

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

    const { data: company, isLoading: isLoadingCompany } = useQuery({
        queryKey: ['company'],
        queryFn: () => GetCompany(session!),
        enabled: !!session?.user?.access_token,
    });

    const hasPermission = (key: string): boolean => {
        if (!employee) return false;
        return !!employee.permissions[key];
    };

    useEffect(() => {
        if (session?.user?.access_token && company) {
            const schemaName = company.schema_name;
            const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
            const rabbitmqUrl = process.env.NEXT_PUBLIC_RABBITMQ_URL;

            if (schemaName && backendUrl && rabbitmqUrl) {
                printService.setConfig({
                    access_token: session.user.access_token,
                    schema_name: schemaName,
                    backend_url: backendUrl,
                    rabbitmq_url: rabbitmqUrl
                }).catch(err => console.error("Falha ao configurar Print Agent:", err));
            }
        }
    }, [session, company]);

    return (
        <UserContext.Provider value={{ user: employee, isLoading, hasPermission }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
