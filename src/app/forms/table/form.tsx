'use client';

import React, { useState } from 'react';
import { TextField, HiddenField } from '../field';
import Table from '@/app/entities/table/table';
import ButtonsModal from '../buttons-modal';
import { useSession } from 'next-auth/react';
import CreateFormsProps from '../create-forms-props';
import DeleteTable from '@/app/api/table/delete/route';
import { useTables } from '@/app/context/table/context';
import NewTable from '@/app/api/table/new/route';
import UpdateTable from '@/app/api/table/update/route';
import { useModal } from '@/app/context/modal/context';

const TableForm = ({ item, isUpdate }: CreateFormsProps<Table>) => {
    const modalName = isUpdate ? 'edit-table' : 'new-table'
    const modalHandler = useModal();
    const context = useTables();
    const table = item || new Table();
    const [id, setId] = useState(table.id);
    const [name, setName] = useState(table.name);
    const { data } = useSession();
    const [error, setError] = useState<string | null>(null);
    
    const submit = async () => {
        if (!data) return;

        table.id = id;
        table.name = name;

        try {
            const response = isUpdate ? await UpdateTable(table, data) : await NewTable(table, data)
    
            if (!isUpdate) {
                table.id = response
                context.addItem(table);
            } else {
                context.updateItem(table);
            }

            modalHandler.hideModal(modalName);
        } catch (error) {
            setError((error as Error).message);
        }
    }

    const onDelete = async () => {
        if (!data) return;
        DeleteTable(table.id, data);
        context.removeItem(table.id)
        modalHandler.hideModal(modalName);
    }

    return (
        <>
            {error && <p className="mb-4 text-red-500">{error}</p>}
            <TextField friendlyName='Nome' name='name' setValue={setName} value={name}/>
            <HiddenField name='id' setValue={setId} value={id}/>

            {error && <p className="mb-4 text-red-500">{error}</p>}
            <ButtonsModal isUpdate={table.id !== ''} onSubmit={submit} onDelete={onDelete} onCancel={() =>modalHandler.hideModal(modalName)}/>
        </>
    );
};

export default TableForm;
