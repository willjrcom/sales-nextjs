'use client';

import React, { useState } from 'react';
import { TextField, HiddenField, CheckboxField } from '../../components/modal/field';
import Quantity, { ValidateQuantityForm } from '@/app/entities/quantity/quantity';
import ButtonsModal from '../../components/modal/buttons-modal';
import { useSession } from 'next-auth/react';
import CreateFormsProps from '../create-forms-props';
import DeleteQuantity from '@/app/api/quantity/delete/route';
import NewQuantity from '@/app/api/quantity/new/route';
import UpdateQuantity from '@/app/api/quantity/update/route';
import { useModal } from '@/app/context/modal/context';
import ErrorForms from '../../components/modal/error-forms';
import RequestError from '@/app/api/error';

interface QuantityFormProps extends CreateFormsProps<Quantity> {
    categoryID: string
}
const QuantityForm = ({ item, isUpdate, categoryID }: QuantityFormProps) => {
    const modalName = isUpdate ? 'edit-quantity-' + item?.id : 'new-quantity'
    const modalHandler = useModal();
    const [quantity, setQuantity] = useState<Quantity>(item || new Quantity());
    
    const { data } = useSession();
    const [error, setError] = useState<RequestError | null>(null);
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    
    const handleInputChange = (field: keyof Quantity, value: any) => {
        setQuantity(prev => ({ ...prev, [field]: value }));
    };

    const submit = async () => {
        if (!data) return;

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
            <TextField friendlyName='Nome' name='name' setValue={value => handleInputChange('quantity', Number(value) || 0)} value={quantity.quantity.toString()}/>
            <CheckboxField friendlyName='Disponivel' name='is_active' setValue={value => handleInputChange('is_active', value)} value={quantity.is_active.toString()}/>
            <HiddenField name='id' setValue={value => handleInputChange('id', value)} value={quantity.id}/>
            <HiddenField name='category_id' setValue={value => handleInputChange('category_id', value)} value={quantity.category_id}/>

            {error && <p className="mb-4 text-red-500">{error.message}</p>}
            <ErrorForms errors={errors} />
            <ButtonsModal item={quantity} name="Quantidade" onSubmit={submit} deleteItem={onDelete} />
        </>
    );
};

export default QuantityForm;
