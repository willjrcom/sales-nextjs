'use client';

import React, { useState } from 'react';
import { TextField, HiddenField, CheckboxField } from '../../components/modal/field';
import Table, { ValidateTableForm } from '@/app/entities/table/table';
import ButtonsModal from '../../components/modal/buttons-modal';
import { useSession } from 'next-auth/react';
import CreateFormsProps from '../create-forms-props';
import DeleteTable from '@/app/api/table/delete/route';
import NewTable from '@/app/api/table/new/route';
import UpdateTable from '@/app/api/table/update/route';
import { useModal } from '@/app/context/modal/context';
import ErrorForms from '../../components/modal/error-forms';
import RequestError from '@/app/api/error';
import { addTable, removeTable, updateTable } from '@/redux/slices/tables';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/redux/store';

const TableForm = ({ item, isUpdate }: CreateFormsProps<Table>) => {
    const modalName = isUpdate ? 'edit-table-' + item?.id : 'new-table'
    const modalHandler = useModal();
    const [table, setTable] = useState<Table>(item || new Table());
    const { data } = useSession();
    const [error, setError] = useState<RequestError | null>(null);
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
            setError(null);

            if (!isUpdate) {
                table.id = response
                dispatch(addTable(table));
            } else {
                dispatch(updateTable(table));
            }

            modalHandler.hideModal(modalName);
        } catch (error) {
            setError(error as RequestError);
        }
    }

    const onDelete = async () => {
        if (!data) return;
        DeleteTable(table.id, data);
        dispatch(removeTable(table));
        modalHandler.hideModal(modalName);
    }

    return (
        <>
            <TextField friendlyName='Nome' name='name' setValue={value => handleInputChange('name', value)} value={table.name}/>
            <CheckboxField friendlyName='Disponivel' name='is_active' setValue={value => handleInputChange('is_available', value)} value={table.is_available}/>
            <HiddenField name='id' setValue={value => handleInputChange('id', value)} value={table.name}/>

            {error && <p className='mb-4 text-red-500'>{error.message}</p>}
            <ErrorForms errors={errors} />
            <ButtonsModal item={table} name="Table" onSubmit={submit} deleteItem={onDelete} />
        </>
    );
};

export default TableForm;
