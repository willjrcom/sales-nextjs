import React, { useCallback, useState } from "react";
import Employee from "@/app/entities/employee/employee";
import { HiOutlineUser, HiOutlinePhone, HiOutlineHome, HiOutlineIdentification, HiOutlineMail, HiOutlineCalendar } from "react-icons/hi";
import { useSession } from "next-auth/react";
import { notifyError, notifySuccess } from "@/app/utils/notifications";
import { useModal } from "@/app/context/modal/context";
import RequestError from "@/app/utils/error";
import CheckboxField from "@/app/components/modal/fields/checkbox";
import UpdateEmployee from "@/app/api/employee/update/employee";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import ButtonsModal from "@/app/components/modal/buttons-modal";
import { useForm } from 'react-hook-form';
import { z } from "zod";

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
    const queryClient = useQueryClient();
    const { data: session } = useSession();
    const modalHandler = useModal();

    const {
        handleSubmit,
        setValue,
        watch,
        formState: { isSubmitting }
    } = useForm({
        defaultValues: {
            ...item,
            contact: item.contact?.number || '',
            cep: item.address?.cep || '',
            street: item.address?.street || '',
            number: item.address?.number || '',
            neighborhood: item.address?.neighborhood || '',
            city: item.address?.city || '',
            uf: item.address?.uf || '',
            is_active: item.is_active,
        }
    });

    const is_active = watch('is_active');

    const updateMutation = useMutation({
        mutationFn: (formData: any) => {
            const employeeToSave = new Employee(item);
            Object.assign(employeeToSave, formData);
            return UpdateEmployee(employeeToSave, session!);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employees'] });
            notifySuccess(`Funcionário ${item.name} atualizado com sucesso`);
            modalHandler.hideModal(modalName);
        },
        onError: (error: RequestError) => {
            notifyError(error.message || 'Erro ao atualizar funcionário');
        }
    });

    const onUpdate = async (formData: any) => {
        if (!session) return;
        updateMutation.mutate(formData);
    }

    const onInvalid = () => {
        notifyError('Formulário incompleto. Verifique os campos obrigatórios.');
    };

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
                        <span className={!item.contact?.number ? 'text-gray-400 italic text-sm' : ''}>
                            {item.contact?.number || 'Campo não cadastrado'}
                        </span>
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    <span className="text-gray-400 uppercase text-xs font-semibold tracking-wider">Endereço</span>
                    <div className="flex items-start gap-2 text-gray-700">
                        <HiOutlineHome size={20} className="text-blue-500 mt-0.5" />
                        <div className="flex flex-col text-sm">
                            {item.address?.street ? (
                                <>
                                    <span>{`${item.address.street}, ${item.address.number}`}</span>
                                    <div>{item.address.neighborhood}</div>
                                    <div>{item.address.city} - CEP: {item.address.cep}</div>
                                </>
                            ) : (
                                <span className="text-gray-400 italic">Campo não cadastrado</span>
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
                        value={is_active}
                        setValue={(value: any) => setValue('is_active', value as boolean)}
                    />
                </div>
            </div>
            <ButtonsModal
                item={{ id: item.id, name: item.name }}
                name="Funcionário"
                onSubmit={handleSubmit(onUpdate, onInvalid)}
                isPending={updateMutation.isPending || isSubmitting}
            />
        </>
    );
}
