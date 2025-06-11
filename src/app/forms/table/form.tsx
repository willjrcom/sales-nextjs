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
import { addTable, removeTable, updateTable } from '@/redux/slices/tables';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/redux/store';

const TableForm = ({ item, isUpdate }: CreateFormsProps<Table>) => {
    const modalName = isUpdate ? 'edit-table-' + item?.id : 'new-table'
    const modalHandler = useModal();
    const [table, setTable] = useState<Table>(item || new Table());
    const { data } = useSession();
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const dispatch = useDispatch<AppDispatch>();
    
    const handleInputChange = (field: keyof Table, value: any) => {
        setTable(prev => ({ ...prev, [field]: value }));
    };

    const submit = async () => {
        if (!data) return;

        const validationErrors = ValidateTableForm(table);
        if (Object.values(validationErrors).length > 0) return setErrors(validationErrors);

        try {
            const response = isUpdate ? await UpdateTable(table, data) : await NewTable(table, data)

            if (!isUpdate) {
                table.id = response
                dispatch(addTable(table));
            notifySuccess(`Mesa ${table.name} criada com sucesso`);
            } else {
                dispatch(updateTable({ type: "UPDATE", payload: { id: table.id, changes: table } }));
            notifySuccess(`Mesa ${table.name} atualizada com sucesso`);
            }

            modalHandler.hideModal(modalName);
        } catch (error: RequestError | any) {
            notifyError(error.message || 'Erro ao salvar mesa');
        }
    }

    const onDelete = async () => {
        if (!data) return;
        DeleteTable(table.id, data);
        dispatch(removeTable(table.id));
        modalHandler.hideModal(modalName);
        notifySuccess(`Mesa ${table.name} removida com sucesso`);
    }

    return (
        <>
            <TextField friendlyName='Nome' name='name' setValue={value => handleInputChange('name', value)} value={table.name}/>

            <CheckboxField friendlyName='Disponivel' name='is_active' setValue={value => handleInputChange('is_available', value)} value={table.is_available}/>
                
            <HiddenField name='id' setValue={value => handleInputChange('id', value)} value={table.name}/>

            <ErrorForms errors={errors} setErrors={setErrors} />
            <ButtonsModal item={table} name="Table" onSubmit={submit} deleteItem={onDelete} />
        </>
    );
};

export default TableForm;
