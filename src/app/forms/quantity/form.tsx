'use client';

import React, { useState } from 'react';
import { HiddenField } from '../../components/modal/field';
import Quantity, { ValidateQuantityForm } from '@/app/entities/quantity/quantity';
import { notifySuccess, notifyError } from '@/app/utils/notifications';
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
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/redux/store';
import { updateCategory } from '@/redux/slices/categories';

interface QuantityFormProps extends CreateFormsProps<Quantity> {
    category: Category;
    onQuantitiesChange: (builder: (prev: Quantity[]) => Quantity[]) => Quantity[];
}

const QuantityForm = ({ item, isUpdate, category, onQuantitiesChange }: QuantityFormProps) => {
    const modalName = isUpdate ? 'edit-quantity-' + item?.id : 'new-quantity';
    const modalHandler = useModal();
    const dispatch = useDispatch<AppDispatch>();
    const [quantity, setQuantity] = useState<Quantity>(item || new Quantity());

    const { data } = useSession();
    const [errors, setErrors] = useState<Record<string, string[]>>({});

    const handleInputChange = (field: keyof Quantity, value: any) => {
        setQuantity(prev => ({ ...prev, [field]: value }));
    };

    const applyQuantitiesChange = (builder: (prevQuantities: Quantity[]) => Quantity[]) => {
        const nextQuantities = onQuantitiesChange(builder);
        dispatch(updateCategory({ type: "UPDATE", payload: { id: category.id, changes: { quantities: [...nextQuantities] } } }));
        return nextQuantities;
    };

    const submit = async () => {
        if (!data || !category) return;

        quantity.category_id = category.id;

        const validationErrors = ValidateQuantityForm(quantity);
        if (Object.values(validationErrors).length > 0) return setErrors(validationErrors);

        try {
            const response = isUpdate ? await UpdateQuantity(quantity, data) : await NewQuantity(quantity, data)
            let nextQuantities: Quantity[] | null = null;
            if (isUpdate) {
                const updatedQuantity = { ...quantity };
                nextQuantities = applyQuantitiesChange(prev => prev.map(q => q.id === updatedQuantity.id ? updatedQuantity : q));
                notifySuccess(`Quantidade ${updatedQuantity.quantity} atualizada com sucesso`);
            } else {
                const createdQuantity = { ...quantity, id: response };
                nextQuantities = applyQuantitiesChange(prev => [...prev, createdQuantity]);
                notifySuccess(`Quantidade ${createdQuantity.quantity} adicionada com sucesso`);
            }
            modalHandler.hideModal(modalName);
        } catch (error) {
            const err = error as RequestError;
            notifyError(err.message || 'Erro ao salvar quantidade');
        }
    }

    const onDelete = async () => {
        if (!data) return;
        try {
            await DeleteQuantity(quantity.id, data);
            applyQuantitiesChange(prev => prev.filter(q => q.id !== quantity.id));

            notifySuccess(`Quantidade ${quantity.quantity} removida com sucesso`);
            modalHandler.hideModal(modalName);
        } catch (error: RequestError | any) {
            notifyError(error.message || 'Erro ao remover quantidade');
        }
    }

    const isDefaultCategory = !category.is_additional && !category.is_complement;

    return (
        <div className="text-black space-y-6">
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-lg shadow-sm border border-gray-100 p-6 transition-all duration-300 hover:shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Informações da Quantidade</h3>
                <div className="transform transition-transform duration-200 hover:scale-[1.01]">
                    <NumericField friendlyName='Quantidade' name='quantity' setValue={value => handleInputChange('quantity', value)} value={quantity.quantity} disabled={isUpdate} />
                </div>
            </div>

            <HiddenField name='id' setValue={value => handleInputChange('id', value)} value={quantity.id} />
            <HiddenField name='category_id' setValue={value => handleInputChange('category_id', value)} value={category?.id} />

            <ErrorForms errors={errors} setErrors={setErrors} />
            {!isUpdate && <ButtonsModal item={{ ...quantity, name: quantity.quantity.toString() }} name="quantity" onSubmit={submit} />}
            {isUpdate && isDefaultCategory && <ButtonsModal item={{ ...quantity, name: quantity.quantity.toString() }} name="quantity" deleteItem={onDelete} />}
        </div>
    );
};

export default QuantityForm;
