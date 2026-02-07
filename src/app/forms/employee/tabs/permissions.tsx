import React, { useEffect, useState } from "react";
import Employee from "@/app/entities/employee/employee";
import { useSession } from "next-auth/react";
import { notifyError } from "@/app/utils/notifications";
import RequestError from "@/app/utils/error";
import CheckboxField from "@/app/components/modal/fields/checkbox";
import UpdateEmployee from "@/app/api/employee/update/employee";

interface EmployeePermissionsTabProps {
    item: Employee;
}

export default function EmployeePermissionsTab({ item }: EmployeePermissionsTabProps) {
    const { data } = useSession();
    const [permissions, setPermissions] = useState<Record<string, boolean>>(item.permissions);

    // Lista de permissões disponíveis (deve ser igual ao backend)
    const availablePermissions = [
        { key: 'view_orders', label: 'Visualizar Pedidos' },
        { key: 'edit_orders', label: 'Editar Pedidos' },
        { key: 'manage_users', label: 'Gerenciar Usuários' },
    ];

    useEffect(() => {
        if (permissions && Object.keys(permissions).length > 0) {
            updatePermissions();
        }
    }, [permissions, data, item]);

    const updatePermissions = async () => {
        if (!data) return;

        try {
            const employeeWithPermissions = { ...item, permissions } as Employee;
            await UpdateEmployee(employeeWithPermissions, data);
        } catch (error: RequestError | any) {
            console.error('Erro ao atualizar permissões:', error);

            // Extrai a mensagem de erro de forma mais robusta
            let errorMessage = "Erro ao atualizar permissões";

            if (error && typeof error === 'object') {
                if (error.message) {
                    errorMessage = error.message;
                } else if (error.error) {
                    errorMessage = error.error;
                } else if (error.toString) {
                    errorMessage = error.toString();
                }
            } else if (typeof error === 'string') {
                errorMessage = error;
            }

            notifyError(errorMessage);
        }
    }

    return (
        <div className="flex flex-col gap-4">
            {availablePermissions.map((perm) => (
                <CheckboxField
                    key={perm.key}
                    friendlyName={perm.label}
                    name={perm.key}
                    value={permissions[perm.key] || false}
                    setValue={(val) => {
                        const boolVal = typeof val === 'function' ? val(permissions[perm.key] || false) : val;
                        setPermissions(prev => ({ ...prev, [perm.key]: boolVal }));
                    }}
                />
            ))}
        </div>
    );
}
