'use client';

import React, { useState } from 'react';
import { TextField, HiddenField, CheckboxField } from '../field';
import Size from '@/app/entities/size/size';
import ButtonsModal from '../buttons-modal';
import { useSession } from 'next-auth/react';
import CreateFormsProps from '../create-forms-props';
import DeleteSize from '@/app/api/size/delete/route';
import ModalHandler from '@/app/components/modal/modal';
import NewSize from '@/app/api/size/new/route';
import UpdateSize from '@/app/api/size/update/route';

interface SizeFormProps extends CreateFormsProps<Size> {
    categoryID: string
}
const SizeForm = ({ item, isUpdate, categoryID }: SizeFormProps) => {
    const modalHandler = ModalHandler();
    const size = item || new Size();
    const [id, setId] = useState(size.id);
    const [name, setName] = useState(size.name);
    const [isActive, setIsActive] = useState(size.is_active);
    const { data } = useSession();
    const [error, setError] = useState<string | null>(null);
    
    const submit = async () => {
        if (!data) return;

        size.id = id;
        size.name = name;
        size.is_active = isActive
        size.category_id = categoryID

        try {
            const response = isUpdate ? await UpdateSize(size, data) : await NewSize(size, data)
    
            if (response) {
                modalHandler.setShowModal(false);
            }

        } catch (error) {
            setError((error as Error).message);
        }
    }

    const onDelete = async () => {
        if (!data) return;
        DeleteSize(size.id, data);
        modalHandler.setShowModal(false);
    }

    return (
        <>
            {error && <p className="mb-4 text-red-500">{error}</p>}
            <TextField friendlyName='Nome' name='name' setValue={setName} value={name}/>
            <CheckboxField friendlyName='Disponivel' name='is_active' setValue={setIsActive} value={isActive.toString()}/>
            <HiddenField name='id' setValue={setId} value={id}/>

            {error && <p className="mb-4 text-red-500">{error}</p>}
            <ButtonsModal isUpdate={size.id !== ''} onSubmit={submit} onDelete={onDelete} onCancel={() =>modalHandler.setShowModal(false)}/>
        </>
    );
};

export default SizeForm;
