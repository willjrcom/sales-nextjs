import { useEffect, useState } from "react";
import Employee from "@/app/entities/employee/employee";
import { useSession } from "next-auth/react";
import { notifyError } from "@/app/utils/notifications";
import RequestError from "@/app/utils/error";
import CheckboxField from "@/app/components/modal/fields/checkbox";
import UpdateEmployee from "@/app/api/employee/update/employee";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import GetMeEmployee from "@/app/api/employee/me/employee";
import { ChevronRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PermissionNodeProps {
    node: any;
    permissions: Record<string, boolean>;
    setPermissions: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
    item: Employee;
    employee: Employee | undefined;
    protectedPermissions: string[];
}
interface EmployeePermissionsTabProps {
    item: Employee;
}

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

export default function EmployeePermissionsTab({ item }: EmployeePermissionsTabProps) {
    const { data } = useSession();
    const queryClient = useQueryClient();
    const [permissions, setPermissions] = useState<Record<string, boolean>>(item.permissions);

    const { data: employee } = useQuery({
        queryKey: ['me-employee'],
        queryFn: () => GetMeEmployee(data!),
        enabled: !!data?.user?.access_token,
    });

    // Lista de permissões disponíveis (deve ser igual ao backend)
    const availablePermissions = [
        {
            key: 'orders', label: 'Pedidos', values: [
                { key: 'new-order', label: 'Novo Pedido' },
                { key: 'order-process', label: 'Editar Processos de Pedidos' },
                { key: 'order-control', label: 'Editar Pedidos' },
                { key: 'order-table-control', label: 'Editar pedidos de Mesas' },
                { key: 'order-pickup-control', label: 'Editar pedidos de Balcões/Retiradas' },
            ]
        },
        {
            key: 'order-delivery-control', label: 'Entregas', values: [
                { key: 'order-delivery-control-to-ship', label: 'Enviar pedidos de Entregas' },
                { key: 'order-delivery-control-to-finish', label: 'Receber pedidos de Entregas' },
                { key: 'order-delivery-control-finished', label: 'Finalizar pedidos de Entregas' },
            ]
        },
        {
            key: 'registers', label: 'Cadastros', values: [
                { key: 'client', label: 'Gerenciar Clientes' },
                { key: 'employee', label: 'Gerenciar Funcionários' },
                { key: 'place', label: 'Gerenciar Mesas e Ambientes' },
                { key: 'product', label: 'Gerenciar Produtos' },
                { key: 'category', label: 'Gerenciar Categorias' },
                { key: 'process-rule', label: 'Gerenciar Regras de Processos' },
                { key: 'manage-stock', label: 'Gerenciar Estoques' },
            ]
        },
        {
            key: 'company', label: 'Empresa', values: [
                { key: 'manage-company', label: 'Gerenciar Empresa' },
                { key: 'print', label: 'Teste de Impressão' },
                { key: 'shift', label: 'Gerenciar Turnos' },
                { key: 'billing', label: 'Gerenciar Contas de pagamento' },
                { key: 'statistics', label: 'Estatísticas' },
            ]
        },
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
            queryClient.invalidateQueries({ queryKey: ['employees'] });

            if (employee?.user_id === item.user_id) {
                queryClient.invalidateQueries({ queryKey: ['me-employee'] });
            }
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

    // Permissões que o usuário não pode remover de si mesmo para evitar lock-out
    const protectedPermissions = ['employee'];

    return (
        <div className="flex flex-col gap-4">
            <TooltipProvider>
                {availablePermissions.map((node) => (
                    <PermissionNode
                        key={node.key}
                        node={node}
                        permissions={permissions}
                        setPermissions={setPermissions}
                        item={item}
                        employee={employee}
                        protectedPermissions={protectedPermissions}
                    />
                ))}
            </TooltipProvider>
        </div>
    );
}



function PermissionNode({ node, permissions, setPermissions, item, employee, protectedPermissions }: PermissionNodeProps) {
    const [isOpen, setIsOpen] = useState(false);
    const hasChildren = node.values && node.values.length > 0;

    if (hasChildren) {
        return (
            <div className="col-span-1 md:col-span-2 flex flex-col gap-2 mb-4">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
                    <Button variant="ghost" size="icon" className="h-6 w-6 p-0">
                        {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </Button>
                    <h3 className="font-semibold text-muted-foreground select-none">{node.label}</h3>
                </div>

                {isOpen && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-4 border-l transition-all duration-200">
                        {node.values.map((child: any) => (
                            <PermissionNode
                                key={child.key}
                                node={child}
                                permissions={permissions}
                                setPermissions={setPermissions}
                                item={item}
                                employee={employee}
                                protectedPermissions={protectedPermissions}
                            />
                        ))}
                    </div>
                )}
            </div>
        );
    }

    const isDisabled = protectedPermissions.includes(node.key) && employee?.user_id === item.user_id;

    const checkbox = (
        <CheckboxField
            key={node.key}
            friendlyName={node.label}
            name={node.key}
            value={permissions[node.key] || false}
            disabled={isDisabled}
            setValue={(val) => {
                const boolVal = typeof val === 'function' ? val(permissions[node.key] || false) : val;
                setPermissions(prev => ({ ...prev, [node.key]: boolVal }));
            }}
        />
    );

    if (isDisabled) {
        return (
            <Tooltip>
                <TooltipTrigger asChild>
                    <div>
                        {checkbox}
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Você não pode remover seu próprio acesso.</p>
                </TooltipContent>
            </Tooltip>
        );
    }

    return checkbox;
}
