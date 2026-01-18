'use client';

import React, { useState } from 'react';
import { TextField, HiddenField, CheckboxField } from '../../components/modal/field';
import { notifySuccess, notifyError } from '@/app/utils/notifications';
import Table, { ValidateTableForm } from '@/app/entities/table/table';
import ButtonsModal from '../../components/modal/buttons-modal';
import { useSession } from 'next-auth/react';
import CreateFormsProps from '../create-forms-props';
import DeleteTable from '@/app/api/table/delete/table';
import NewTable from '@/app/api/table/new/table';
import UpdateTable from '@/app/api/table/update/table';
import { useModal } from '@/app/context/modal/context';
import ErrorForms from '../../components/modal/error-forms';
import RequestError from '@/app/utils/error';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const TableForm = ({ item, isUpdate }: CreateFormsProps<Table>) => {
    const modalName = isUpdate ? 'edit-table-' + item?.id : 'new-table'
    const modalHandler = useModal();
    const [table, setTable] = useState<Table>(item || new Table());
    const { data } = useSession();
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const queryClient = useQueryClient();

    const handleInputChange = (field: keyof Table, value: any) => {
        setTable(prev => ({ ...prev, [field]: value }));
    };

    const createMutation = useMutation({
        mutationFn: (newTable: Table) => NewTable(newTable, data!),

        onSuccess: (_, newTable) => {
            queryClient.invalidateQueries({ queryKey: ['tables'] });
            queryClient.invalidateQueries({ queryKey: ['unused-tables'] });
            notifySuccess(`Mesa ${newTable.name} criada com sucesso`);
            modalHandler.hideModal(modalName);
        },
        onError: (error: RequestError) => {
            notifyError(error.message || 'Erro ao criar mesa');
        }
    });

    const updateMutation = useMutation({
        mutationFn: (updatedTable: Table) => UpdateTable(updatedTable, data!),
        onSuccess: (_, updatedTable) => {
            queryClient.invalidateQueries({ queryKey: ['tables'] });
            queryClient.invalidateQueries({ queryKey: ['unused-tables'] });
            notifySuccess(`Mesa ${updatedTable.name} atualizada com sucesso`);
            modalHandler.hideModal(modalName);
        },
        onError: (error: RequestError) => {
            notifyError(error.message || 'Erro ao atualizar mesa');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (tableId: string) => DeleteTable(tableId, data!),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tables'] });
            queryClient.invalidateQueries({ queryKey: ['unused-tables'] });
            notifySuccess(`Mesa ${table.name} removido com sucesso`);
            modalHandler.hideModal(modalName);
        },
        onError: (error: RequestError) => {
            notifyError(error.message || `Erro ao remover mesa ${table.name}`);
        }
    });

    const submit = async () => {
        if (!data) return;

        const validationErrors = ValidateTableForm(table);
        if (Object.values(validationErrors).length > 0) return setErrors(validationErrors);

        if (isUpdate) {
            updateMutation.mutate(table);
        } else {
            createMutation.mutate(table);
        }
    }

    const onDelete = async () => {
        if (!data || !table.id) return;
        deleteMutation.mutate(table.id);
    }

    return (
        <div className="text-black space-y-6">
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-lg shadow-sm border border-gray-100 p-6 transition-all duration-300 hover:shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Informações da Mesa</h3>
                <div className="space-y-4">
                    <div className="transform transition-transform duration-200 hover:scale-[1.01]">
                        <TextField friendlyName='Nome' name='name' setValue={value => handleInputChange('name', value)} value={table.name} />
                    </div>
                    <div className="transform transition-transform duration-200 hover:scale-[1.01]">
                        <CheckboxField friendlyName='Disponível' name='is_available' setValue={value => handleInputChange('is_available', value)} value={table.is_available} />
                    </div>
                    {isUpdate && (
                        <div className="transform transition-transform duration-200 hover:scale-[1.01]">
                            <CheckboxField friendlyName='Ativo' name='is_active' setValue={value => handleInputChange('is_active', value)} value={table.is_active} />
                        </div>
                    )}
                </div>
            </div>

            <HiddenField name='id' setValue={value => handleInputChange('id', value)} value={table.name} />

            <ErrorForms errors={errors} setErrors={setErrors} />
            <ButtonsModal item={table} name="Table" onSubmit={submit} />
        </div>
    );
};

export default TableForm;
