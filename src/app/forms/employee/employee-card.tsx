import React, { useEffect, useState } from "react";
import Employee from "@/app/entities/employee/employee";
import Contact from "@/app/entities/contact/contact";
import Address from "@/app/entities/address/address";
import { HiOutlineUser, HiOutlinePhone, HiOutlineHome, HiOutlineIdentification, HiOutlineMail, HiOutlineCalendar } from "react-icons/hi";
import ButtonsModal from "@/app/components/modal/buttons-modal";
import DeleteEmployee from "@/app/api/employee/delete/employee";
import RemoveUserFromCompany from "@/app/api/company/remove/company";
import { useSession } from "next-auth/react";
import { notifyError, notifySuccess } from "@/app/utils/notifications";
import { useModal } from "@/app/context/modal/context";
import RequestError from "@/app/utils/error";
import { getEmployeeSalaryHistory } from "@/app/api/employee/salary-history";
import { getEmployeePayments } from "@/app/api/employee/payments";
import EmployeeSalaryHistoryList from "./EmployeeSalaryHistoryList";
import EmployeePaymentsList from "./EmployeePaymentsList";
import { EmployeePayment, EmployeeSalaryHistory } from "@/app/entities/employee/employee-payment";
import SalaryHistoryModal from "./SalaryHistoryModal";
import PaymentModal from "./PaymentModal";
import CheckboxField from "@/app/components/modal/fields/checkbox";
import UpdateEmployee from "@/app/api/employee/update/employee";
import { useQueryClient } from '@tanstack/react-query';

interface EmployeeCardProps {
    item: Employee;
}

function formatDate(dateString?: string) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: '2-digit' });
}

function EmployeeCard({ item }: EmployeeCardProps) {
    const modalName = "view-employee-" + item.id;
    const contact = item.contact as Contact;
    const address = item.address as Address;
    const queryClient = useQueryClient();
    const { data } = useSession();
    const modalHandler = useModal();
    const [salaryHistory, setSalaryHistory] = useState<EmployeeSalaryHistory[]>([]);
    const [payments, setPayments] = useState<EmployeePayment[]>([]);
    const [tab, setTab] = useState<'info' | 'salary' | 'payments' | 'permissions'>('info');
    const [showSalaryModal, setShowSalaryModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [permissions, setPermissions] = useState<Record<string, boolean>>(item.permissions);

    // Lista de permissões disponíveis (deve ser igual ao backend)
    const availablePermissions = [
        { key: 'view_orders', label: 'Visualizar Pedidos' },
        { key: 'edit_orders', label: 'Editar Pedidos' },
        { key: 'manage_users', label: 'Gerenciar Usuários' },
    ];

    useEffect(() => {
        if (item.id && data) {
            getEmployeeSalaryHistory(item.id, data)
                .then((history) => setSalaryHistory(history.map((h: any) => new EmployeeSalaryHistory(h))))
                .catch((error) => {
                    notifyError('Erro ao carregar histórico salarial');
                });
            
            getEmployeePayments(item.id, data)
                .then((payments) => setPayments(payments.map((p: any) => new EmployeePayment(p))))
                .catch((error) => {
                    notifyError('Erro ao carregar pagamentos');
                });
        }
    }, [item.id, data]);

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

    const onDelete = async () => {
        if (!data) return;
        try {
            await DeleteEmployee(item.id, data);

            await RemoveUserFromCompany(item.email, data)

            notifySuccess('Funcionário removido com sucesso');
            queryClient.invalidateQueries({ queryKey: ['employees'] });
            modalHandler.hideModal(modalName);
        } catch (error: RequestError | any) {
            notifyError(error.message || `Erro ao remover funcionário ${item.name}`);
        }
    }

    const handleSalaryHistorySuccess = (newHistory: any) => {
        setSalaryHistory([new EmployeeSalaryHistory(newHistory), ...salaryHistory]);
        setShowSalaryModal(false);
    };

    const handlePaymentSuccess = (newPayment: any) => {
        setPayments([new EmployeePayment(newPayment), ...payments]);
        setShowPaymentModal(false);
    };

    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-8 mx-auto flex flex-col gap-6 max-w-2xl">
            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                <button className={`px-4 py-2 rounded-t-lg font-semibold border-b-2 transition-colors ${tab === 'info' ? 'border-blue-600 text-blue-700 bg-blue-50' : 'border-transparent text-gray-500 bg-gray-100 hover:bg-blue-50'}`} onClick={() => setTab('info')}>Informações</button>
                <button className={`px-4 py-2 rounded-t-lg font-semibold border-b-2 transition-colors ${tab === 'salary' ? 'border-blue-600 text-blue-700 bg-blue-50' : 'border-transparent text-gray-500 bg-gray-100 hover:bg-blue-50'}`} onClick={() => setTab('salary')}>Histórico Salarial</button>
                <button className={`px-4 py-2 rounded-t-lg font-semibold border-b-2 transition-colors ${tab === 'payments' ? 'border-blue-600 text-blue-700 bg-blue-50' : 'border-transparent text-gray-500 bg-gray-100 hover:bg-blue-50'}`} onClick={() => setTab('payments')}>Pagamentos</button>
                <button className={`px-4 py-2 rounded-t-lg font-semibold border-b-2 transition-colors ${tab === 'permissions' ? 'border-blue-600 text-blue-700 bg-blue-50' : 'border-transparent text-gray-500 bg-gray-100 hover:bg-blue-50'}`} onClick={() => setTab('permissions')}>Permissões</button>
            </div>

            {/* Tab content */}
            {tab === 'info' && (
                <>
                    <div className="flex items-center gap-4 border-b pb-4">
                        <div className="bg-blue-100 text-blue-600 rounded-full p-3">
                            <HiOutlineUser size={32} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">{item.name}</h2>
                            <div className="flex items-center gap-2 mt-1 text-gray-500">
                                <HiOutlineIdentification size={18} />
                                <span className="text-sm font-medium">CPF: {item.cpf}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-gray-500">
                                <HiOutlineMail size={18} />
                                <span className="text-sm font-medium">{item.email}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-gray-500">
                                <HiOutlineCalendar size={18} />
                                <span className="text-sm font-medium">Nascimento: {formatDate(item.birthday)}</span>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                        <div className="flex flex-col gap-2">
                            <span className="text-gray-400 uppercase text-xs font-semibold tracking-wider">Contato</span>
                            <div className="flex items-center gap-2 text-gray-700">
                                <HiOutlinePhone size={20} className="text-blue-500" />
                                <span>{contact ? `(${contact.ddd}) ${contact.number}` : '-'}</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <span className="text-gray-400 uppercase text-xs font-semibold tracking-wider">Endereço</span>
                            <div className="flex items-start gap-2 text-gray-700">
                                <HiOutlineHome size={20} className="text-blue-500 mt-0.5" />
                                <div className="flex flex-col text-sm">
                                    <span>{address ? `${address.street}, ${address.number}` : '-'}</span>
                                    {address && (
                                        <>
                                            <span>{address.neighborhood}</span>
                                            <span>{address.city} - CEP: {address.cep}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-6">
                        <ButtonsModal
                            item={item}
                            name="Funcionário"
                            deleteItem={onDelete}
                            deleteLabel="Demitir"
                        />
                    </div>
                </>
            )}
            {tab === 'salary' && (
                <>
                    <div className="flex justify-end mb-4">
                        <button
                            className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700 transition"
                            onClick={() => setShowSalaryModal(true)}
                        >
                            Alterar Salário
                        </button>
                    </div>
                    <EmployeeSalaryHistoryList history={salaryHistory} />
                    {showSalaryModal && (
                        <SalaryHistoryModal
                            employeeId={item.id}
                            onClose={() => setShowSalaryModal(false)}
                            onSuccess={handleSalaryHistorySuccess}
                        />
                    )}
                </>
            )}
            {tab === 'payments' && (
                <>
                    <div className="flex justify-end mb-4">
                        <button
                            className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition"
                            onClick={() => setShowPaymentModal(true)}
                        >
                            Novo Pagamento
                        </button>
                    </div>
                    <EmployeePaymentsList payments={payments} />
                    {showPaymentModal && (
                        <PaymentModal
                            employeeId={item.id}
                            onClose={() => setShowPaymentModal(false)}
                            onSuccess={handlePaymentSuccess}
                        />
                    )}
                </>
            )}
            {tab === 'permissions' && (
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
            )}
        </div>
    );
}

export default EmployeeCard; 