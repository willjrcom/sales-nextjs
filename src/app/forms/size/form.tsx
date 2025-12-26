'use client';

import React, { useState } from 'react';
import { TextField, HiddenField, CheckboxField } from '../../components/modal/field';
import Size, { ValidateSizeForm } from '@/app/entities/size/size';
import { notifyError } from '@/app/utils/notifications';
import ButtonsModal from '../../components/modal/buttons-modal';
import { useSession } from 'next-auth/react';
import CreateFormsProps from '../create-forms-props';
import DeleteSize from '@/app/api/size/delete/size';
import NewSize from '@/app/api/size/new/size';
import UpdateSize from '@/app/api/size/update/size';
import { useModal } from '@/app/context/modal/context';
import ErrorForms from '../../components/modal/error-forms';
import RequestError from '@/app/utils/error';
import Category from '@/app/entities/category/category';
import { notifySuccess } from '@/app/utils/notifications';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface SizeFormProps extends CreateFormsProps<Size> {
    category: Category
}

const SizeForm = ({ item, isUpdate, category }: SizeFormProps) => {
    const modalName = isUpdate ? 'edit-size-' + item?.id : 'new-size'
    const modalHandler = useModal();
    const queryClient = useQueryClient();
    const [size, setSize] = useState<Size>(item || new Size());
    const { data } = useSession();
    const [errors, setErrors] = useState<Record<string, string[]>>({});

    const handleInputChange = (field: keyof Size, value: any) => {
        setSize(prev => ({ ...prev, [field]: value }));
    };

    const createMutation = useMutation({
        mutationFn: (newSize: Size) => NewSize(newSize, data!),

        onSuccess: (response, newSize) => {
            newSize.id = response;
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            queryClient.invalidateQueries({ queryKey: ['category', category.id] });
            
            notifySuccess(`Tamanho ${newSize.name} criado com sucesso`);
            modalHandler.hideModal(modalName);
        },
        onError: (error: RequestError) => {
            notifyError(error.message || 'Erro ao criar tamanho');
        }
    });

    const updateMutation = useMutation({
        mutationFn: (updatedSize: Size) => UpdateSize(updatedSize, data!),
        onSuccess: (_, updatedSize) => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            queryClient.invalidateQueries({ queryKey: ['category', category.id] });

            notifySuccess(`Tamanho ${updatedSize.name} atualizado com sucesso`);
            modalHandler.hideModal(modalName);
        },
        onError: (error: RequestError) => {
            notifyError(error.message || 'Erro ao atualizar tamanho');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (sizeId: string) => DeleteSize(sizeId, data!),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            queryClient.invalidateQueries({ queryKey: ['category', category.id] });

            notifySuccess(`Tamanho ${size.name} removido com sucesso`);
            modalHandler.hideModal(modalName);
        },
        onError: (error: RequestError) => {
            notifyError(error.message || `Erro ao remover tamanho ${size.name}`);
        }
    });

    const submit = async () => {
        if (!data || !category) return;

        size.category_id = category.id

        const validationErrors = ValidateSizeForm(size);
        if (Object.values(validationErrors).length > 0) return setErrors(validationErrors);

        if (isUpdate) {
            updateMutation.mutate(size);
        } else {
            createMutation.mutate(size);
        }
    }

    const onDelete = async () => {
        if (!data || !size.id) return;
        deleteMutation.mutate(size.id);
    }
    
    const isDefaultCategory = !category.is_additional && !category.is_complement;

    return (
        <div className="text-black space-y-6">
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-lg shadow-sm border border-gray-100 p-6 transition-all duration-300 hover:shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Informações do Tamanho</h3>
                <div className="space-y-4">
                    <div className="transform transition-transform duration-200 hover:scale-[1.01]">
                        <TextField friendlyName='Nome' name='name' setValue={value => handleInputChange('name', value)} value={size.name} />
                    </div>
                    {isDefaultCategory && (
                        <div className="transform transition-transform duration-200 hover:scale-[1.01]">
                            <CheckboxField friendlyName='Disponivel' name='is_active' setValue={value => handleInputChange('is_active', value)} value={size.is_active} />
                        </div>
                    )}
                </div>
            </div>

            <HiddenField name='id' setValue={value => handleInputChange('id', value)} value={size.id} />
            <HiddenField name='category_id' setValue={value => handleInputChange('category_id', value)} value={category?.id} />

            <ErrorForms errors={errors} setErrors={setErrors} />
            {isDefaultCategory && <ButtonsModal item={size} name="Tamanho" onSubmit={submit} deleteItem={onDelete} />}
            {!isDefaultCategory && <ButtonsModal item={size} name="Tamanho" onSubmit={submit} />}
        </div>
    );
};

export default SizeForm;
