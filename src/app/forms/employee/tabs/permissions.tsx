import { useEffect, useState } from "react";
import Employee from "@/app/entities/employee/employee";
import { useSession } from "next-auth/react";
import { notifyError } from "@/app/utils/notifications";
import RequestError from "@/app/utils/error";
import CheckboxField from "@/app/components/modal/fields/checkbox";
import UpdateEmployee from "@/app/api/employee/update/employee";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import GetMeEmployee from "@/app/api/employee/me/employee";

export default function EmployeePermissionsTab() {
    const { data } = useSession();
    const queryClient = useQueryClient();

    const { data: user, isLoading } = useQuery({
        queryKey: ['me-employee'],
        queryFn: () => GetMeEmployee(data!),
        enabled: !!data?.user?.access_token,
    });

    const [permissions, setPermissions] = useState<Record<string, boolean>>(user?.permissions || {});


    // Lista de permissões disponíveis (deve ser igual ao backend)
    const availablePermissions = [
        { key: 'billing', label: 'Gerenciar Contas de pagamento' },
        { key: 'client', label: 'Gerenciar Clientes' },
        { key: 'employee', label: 'Gerenciar Funcionários' },
        { key: 'new-order', label: 'Novo Pedido' },
        { key: 'order-control', label: 'Editar Pedidos' },
        { key: 'order-delivery-control', label: 'Editar pedidos de Entregas' },
        { key: 'order-pickup-control', label: 'Editar pedidos de Balcões/Retiradas' },
        { key: 'order-process', label: 'Editar Processos' },
        { key: 'order-table-control', label: 'Editar pedidos de Mesas' },
        { key: 'place', label: 'Gerenciar Mesas e Ambientes' },
        { key: 'print', label: 'Teste de Impressão' },
        { key: 'product', label: 'Gerenciar Produtos, Categorias e Processos' },
        { key: 'manage-stock', label: 'Gerenciar Estoques' },
        { key: 'shift', label: 'Gerenciar Turnos' },
        { key: 'manage-company', label: 'Gerenciar Empresa' },
    ];

    useEffect(() => {
        if (permissions && Object.keys(permissions).length > 0) {
            updatePermissions();
        }
    }, [permissions, data, user]);

    const updatePermissions = async () => {
        if (!data) return;

        try {
            const employeeWithPermissions = { ...user, permissions } as Employee;
            await UpdateEmployee(employeeWithPermissions, data);
            queryClient.invalidateQueries({ queryKey: ['me-employee'] });
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
