import React, { useCallback, useState } from "react";
import Employee from "@/app/entities/employee/employee";
import Contact from "@/app/entities/contact/contact";
import Address from "@/app/entities/address/address";
import { HiOutlineUser, HiOutlinePhone, HiOutlineHome, HiOutlineIdentification, HiOutlineMail, HiOutlineCalendar } from "react-icons/hi";
import { useSession } from "next-auth/react";
import { notifyError, notifySuccess } from "@/app/utils/notifications";
import { useModal } from "@/app/context/modal/context";
import RequestError from "@/app/utils/error";
import CheckboxField from "@/app/components/modal/fields/checkbox";
import UpdateEmployee from "@/app/api/employee/update/employee";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import ButtonsModal from "@/app/components/modal/buttons-modal";

interface EmployeeInfoTabProps {
    item: Employee;
}

function formatDate(dateString?: string) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: '2-digit' });
}

export default function EmployeeInfoTab({ item }: EmployeeInfoTabProps) {
    const modalName = "view-employee-" + item.id;
    const [employee, setEmployee] = useState<Employee>(new Employee(item));
    const contact = new Contact(item.contact);
    const address = new Address(item.address);
    const queryClient = useQueryClient();
    const { data } = useSession();
    const modalHandler = useModal();

    const handleInputChange = useCallback((field: keyof Employee, value: any) => {
        setEmployee(prev => ({
            ...prev,
            [field]: value
        } as Employee));
    }, [setEmployee]);

    const updateMutation = useMutation({
        mutationFn: (updatedEmployee: Employee) => UpdateEmployee(updatedEmployee, data!),
        onSuccess: (_, updatedEmployee) => {
            queryClient.invalidateQueries({ queryKey: ['employees'] });
            notifySuccess(`Funcionário ${updatedEmployee.name} atualizado com sucesso`);
            modalHandler.hideModal(modalName);
        },
        onError: (error: RequestError) => {
            notifyError(error.message || 'Erro ao atualizar funcionário');
        }
    });

    const onUpdate = async () => {
        if (!data) return;
        updateMutation.mutate(employee);
    }

    return (
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
                        <span>{contact ? contact.number : '-'}</span>
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
            <div className="mt-6 flex justify-end items-center gap-4">
                <div className="w-48">
                    <CheckboxField
                        friendlyName="Ativo"
                        name="is_active"
                        value={employee.is_active}
                        setValue={value => handleInputChange('is_active', value)}
                    />
                </div>
            </div>
            <ButtonsModal item={employee} name="Funcionário" onSubmit={onUpdate} />
        </>
    );
}
