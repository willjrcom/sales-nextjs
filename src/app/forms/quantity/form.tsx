'use client';

import React, { useState } from 'react';
import { TextField, HiddenField, CheckboxField, NumberField } from '../field';
import Quantity, { ValidateQuantityForm } from '@/app/entities/quantity/quantity';
import ButtonsModal from '../buttons-modal';
import { useSession } from 'next-auth/react';
import CreateFormsProps from '../create-forms-props';
import DeleteQuantity from '@/app/api/quantity/delete/route';
import NewQuantity from '@/app/api/quantity/new/route';
import UpdateQuantity from '@/app/api/quantity/update/route';
import { useModal } from '@/app/context/modal/context';
import ErrorForms from '../error-forms';
import RequestError from '@/app/api/error';

interface QuantityFormProps extends CreateFormsProps<Quantity> {
    categoryID: string
}
const QuantityForm = ({ item, isUpdate, categoryID }: QuantityFormProps) => {
    const modalName = isUpdate ? 'edit-quantity' : 'new-quantity'
    const modalHandler = useModal();
    const quantity = item || new Quantity();
    const [id, setId] = useState(quantity.id);
    const [quantityName, setQuantityName] = useState((quantity.quantity as unknown) as string);
    const [isActive, setIsActive] = useState(quantity.is_active);
    const { data } = useSession();
    const [error, setError] = useState<RequestError | null>(null);
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    
    const submit = async () => {
        if (!data) return;

        quantity.id = id;
        quantity.quantity = Number(quantityName);
        quantity.is_active = isActive;
        quantity.category_id = categoryID;

        const validationErrors = ValidateQuantityForm(quantity);
        if (Object.values(validationErrors).length > 0) return setErrors(validationErrors);

        try {
            isUpdate ? await UpdateQuantity(quantity, data) : await NewQuantity(quantity, data)
            setError(null);

            modalHandler.hideModal(modalName);

        } catch (error) {
            setError(error as RequestError);
        }
    }

    const onDelete = async () => {
        if (!data) return;
        DeleteQuantity(quantity.id, data);
        modalHandler.hideModal(modalName);
    }

    return (
        <>
            <TextField friendlyName='Nome' name='name' setValue={setQuantityName} value={quantityName}/>
            <CheckboxField friendlyName='Disponivel' name='is_active' setValue={setIsActive} value={isActive.toString()}/>
            <HiddenField name='id' setValue={setId} value={id}/>

            {error && <p className="mb-4 text-red-500">{error.message}</p>}
            <ErrorForms errors={errors} />
            <ButtonsModal isUpdate={quantity.id !== ''} onSubmit={submit} onDelete={onDelete} onCancel={() => modalHandler.hideModal(modalName)}/>
        </>
    );
};

export default QuantityForm;
