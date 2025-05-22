'use client';

import React, { useState } from 'react';
import { HiddenField } from '../../components/modal/field';
import Quantity, { ValidateQuantityForm } from '@/app/entities/quantity/quantity';
import ButtonsModal from '../../components/modal/buttons-modal';
import { useSession } from 'next-auth/react';
import CreateFormsProps from '../create-forms-props';
import DeleteQuantity from '@/app/api/quantity/delete/quantity';
import NewQuantity from '@/app/api/quantity/new/quantity';
import UpdateQuantity from '@/app/api/quantity/update/quantity';
import { useModal } from '@/app/context/modal/context';
import ErrorForms from '../../components/modal/error-forms';
import RequestError from '@/app/utils/error';
import Category from '@/app/entities/category/category';
import NumericField from '@/app/components/modal/fields/numeric';

interface QuantityFormProps extends CreateFormsProps<Quantity> {
    category: Category
}

const QuantityForm = ({ item, isUpdate, category }: QuantityFormProps) => {
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
        if (!data || !category) return;

        quantity.category_id = category.id;

        const validationErrors = ValidateQuantityForm(quantity);
        if (Object.values(validationErrors).length > 0) return setErrors(validationErrors);

        try {
            const response = isUpdate ? await UpdateQuantity(quantity, data) : await NewQuantity(quantity, data)
            setError(null);

            if (isUpdate) {
                const index = category.quantities.findIndex(q => q.id === quantity.id);
                if (index !== -1) {
                    category.quantities[index] = quantity;
                }
            } else {
                quantity.id = response;
                category.quantities.push(quantity);
            }

            modalHandler.hideModal(modalName);

        } catch (error) {
            setError(error as RequestError);
        }
    }

    const onDelete = async () => {
        if (!data) return;
        await DeleteQuantity(quantity.id, data);
        
        if (category) {
            category.quantities = category.quantities.filter(q => q.id !== quantity.id);
        }

        modalHandler.hideModal(modalName);
    }

    const isDefaultCategory = !category.is_additional && !category.is_complement;

    return (
        <>
            <NumericField friendlyName='Quantidade' name='quantity' setValue={value => handleInputChange('quantity', value)} value={quantity.quantity} disabled={isUpdate} />

            <HiddenField name='id' setValue={value => handleInputChange('id', value)} value={quantity.id}/>
                
            <HiddenField name='category_id' setValue={value => handleInputChange('category_id', value)} value={category?.id}/>

            {error && <p className="mb-4 text-red-500">{error.message}</p>}
            <ErrorForms errors={errors} />
            {!isUpdate && <ButtonsModal item={{...quantity, name: quantity.quantity.toString()}} name="quantity" onSubmit={submit} />}
            {isUpdate && isDefaultCategory && <ButtonsModal item={{...quantity, name: quantity.quantity.toString()}} name="quantity" deleteItem={onDelete} />}
        </>
    );
};

export default QuantityForm;
