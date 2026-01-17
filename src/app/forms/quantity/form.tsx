'use client';

import React, { useState } from 'react';
import { HiddenField, CheckboxField } from '../../components/modal/field';
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
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface QuantityFormProps extends CreateFormsProps<Quantity> {
    category: Category
    onSuccess?: () => void
}

const QuantityForm = ({ item, isUpdate, category, onSuccess }: QuantityFormProps) => {
    const modalName = isUpdate ? 'edit-quantity-' + item?.id : 'new-quantity';
    const modalHandler = useModal();
    const queryClient = useQueryClient();
    const [quantity, setQuantity] = useState<Quantity>(item || new Quantity());

    const { data } = useSession();
    const [errors, setErrors] = useState<Record<string, string[]>>({});

    const createMutation = useMutation({
        mutationFn: (newQuantity: Quantity) => NewQuantity(newQuantity, data!),

        onSuccess: (response, newQuantity) => {
            newQuantity.id = response;
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            queryClient.invalidateQueries({ queryKey: ['category', category.id] });


            notifySuccess(`Quantidade ${newQuantity.quantity} criada com sucesso`);
            modalHandler.hideModal(modalName);
            onSuccess?.();
        },
        onError: (error: RequestError) => {
            notifyError(error.message || 'Erro ao criar quantitye');
        }
    });

    const updateMutation = useMutation({
        mutationFn: (updatedQuantity: Quantity) => UpdateQuantity(updatedQuantity, data!),
        onSuccess: (_, updatedQuantity) => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            queryClient.invalidateQueries({ queryKey: ['category', category.id] });

            notifySuccess(`Quantidade ${updatedQuantity.quantity} atualizada com sucesso`);
            modalHandler.hideModal(modalName);
            onSuccess?.();
        },
        onError: (error: RequestError) => {
            notifyError(error.message || 'Erro ao atualizar quantitye');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (quantityId: string) => DeleteQuantity(quantityId, data!),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            queryClient.invalidateQueries({ queryKey: ['category', category.id] });

            notifySuccess(`Quantidade ${quantity.quantity} removida com sucesso`);
            modalHandler.hideModal(modalName);
            onSuccess?.();
        },
        onError: (error: RequestError) => {
            notifyError(error.message || `Erro ao remover quantitye ${quantity.quantity}`);
        }
    });

    const handleInputChange = (field: keyof Quantity, value: any) => {
        setQuantity(prev => ({ ...prev, [field]: value }));
    };

    const submit = async () => {
        if (!data || !category) return;

        quantity.category_id = category.id;

        const validationErrors = ValidateQuantityForm(quantity);
        if (Object.values(validationErrors).length > 0) return setErrors(validationErrors);

        if (isUpdate) {
            updateMutation.mutate(quantity);
        } else {
            createMutation.mutate(quantity);
        }
    }

    const onDelete = async () => {
        if (!data || !quantity.id) return;
        deleteMutation.mutate(quantity.id);
    }

    const isDefaultCategory = !category.is_additional && !category.is_complement;

    return (
        <div className="text-black space-y-6">
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-lg shadow-sm border border-gray-100 p-6 transition-all duration-300 hover:shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Informações da Quantidade</h3>
                <div className="space-y-4">
                    <div className="transform transition-transform duration-200 hover:scale-[1.01]">
                        <NumericField friendlyName='Quantidade' name='quantity' setValue={value => handleInputChange('quantity', value)} value={quantity.quantity} disabled={isUpdate} />
                    </div>
                    {isUpdate && isDefaultCategory && (
                        <div className="transform transition-transform duration-200 hover:scale-[1.01]">
                            <CheckboxField friendlyName='Ativo' name='is_active' setValue={value => handleInputChange('is_active', value)} value={quantity.is_active} />
                        </div>
                    )}
                </div>
            </div>

            <HiddenField name='id' setValue={value => handleInputChange('id', value)} value={quantity.id} />
            <HiddenField name='category_id' setValue={value => handleInputChange('category_id', value)} value={category?.id} />

            <ErrorForms errors={errors} setErrors={setErrors} />
            {!isUpdate && <ButtonsModal item={{ ...quantity, name: quantity.quantity.toString() }} name="quantity" onSubmit={submit} />}
            {isUpdate && isDefaultCategory && <ButtonsModal item={{ ...quantity, name: quantity.quantity.toString() }} name="quantity" onSubmit={submit} />}
        </div>
    );
};

export default QuantityForm;
