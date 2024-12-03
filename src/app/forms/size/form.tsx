'use client';

import React, { useState } from 'react';
import { TextField, HiddenField, CheckboxField } from '../../components/modal/field';
import Size, { ValidateSizeForm } from '@/app/entities/size/size';
import ButtonsModal from '../../components/modal/buttons-modal';
import { useSession } from 'next-auth/react';
import CreateFormsProps from '../create-forms-props';
import DeleteSize from '@/app/api/size/delete/route';
import NewSize from '@/app/api/size/new/route';
import UpdateSize from '@/app/api/size/update/route';
import { useModal } from '@/app/context/modal/context';
import ErrorForms from '../../components/modal/error-forms';
import RequestError from '@/app/api/error';

interface SizeFormProps extends CreateFormsProps<Size> {
    categoryID: string
}
const SizeForm = ({ item, isUpdate, categoryID }: SizeFormProps) => {
    const modalName = isUpdate ? 'edit-size-' + item?.id : 'new-size'
    const modalHandler = useModal();
    const [size, setSize] = useState<Size>(item || new Size());
    const { data } = useSession();
    const [error, setError] = useState<RequestError | null>(null);
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    
    const handleInputChange = (field: keyof Size, value: any) => {
        setSize(prev => ({ ...prev, [field]: value }));
    };

    const submit = async () => {
        if (!data) return;

        size.category_id = categoryID

        const validationErrors = ValidateSizeForm(size);
        if (Object.values(validationErrors).length > 0) return setErrors(validationErrors);

        try {
            isUpdate ? await UpdateSize(size, data) : await NewSize(size, data)
            setError(null);

            modalHandler.hideModal(modalName);

        } catch (error) {
            setError(error as RequestError);
        }
    }

    const onDelete = async () => {
        if (!data) return;
        DeleteSize(size.id, data);
        modalHandler.hideModal(modalName);
    }

    return (
        <>
            <TextField friendlyName='Nome' name='name' setValue={value => handleInputChange('name', value)} value={size.name}/>
            <CheckboxField friendlyName='Disponivel' name='is_active' setValue={value => handleInputChange('is_active', value)} value={size.is_active.toString()}/>
            <HiddenField name='id' setValue={value => handleInputChange('id', value)} value={size.id}/>
            <HiddenField name='category_id' setValue={value => handleInputChange('category_id', value)} value={categoryID}/>

            {error && <p className="mb-4 text-red-500">{error.message}</p>}
            <ErrorForms errors={errors} />
            <ButtonsModal item={size} name="Tamanho" onSubmit={submit} deleteItem={onDelete} />
        </>
    );
};

export default SizeForm;
