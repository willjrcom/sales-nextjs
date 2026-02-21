'use client';

import React, { useMemo, useState } from 'react';
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
import { notifySuccess } from '@/app/utils/notifications';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import GetCategoryByID from '@/app/api/category/[id]/category';

interface SizeFormProps extends CreateFormsProps<Size> {
    categoryID: string;
    onSuccess?: () => void;
}

const SizeForm = ({ item, isUpdate, categoryID, onSuccess }: SizeFormProps) => {
    const modalName = isUpdate ? 'edit-size-' + item?.id : 'new-size'
    const modalHandler = useModal();
    const queryClient = useQueryClient();
    const [size, setSize] = useState<Size>(new Size(item));
    const { data } = useSession();
    const [errors, setErrors] = useState<Record<string, string[]>>({});

    const { data: category } = useQuery({
        queryKey: ['category', categoryID],
        queryFn: () => GetCategoryByID(data!, categoryID),
        enabled: !!data?.user?.access_token && !!categoryID,
    });

    const handleInputChange = (field: keyof Size, value: any) => {
        setSize(prev => ({ ...prev, [field]: value }));
    };

    const createMutation = useMutation({
        mutationFn: (newSize: Size) => NewSize(newSize, data!),

        onSuccess: (response, newSize) => {
            newSize.id = response;

            queryClient.invalidateQueries({ queryKey: ['sizes', categoryID] });
            notifySuccess(`Tamanho ${newSize.name} criado com sucesso`);
            if (onSuccess) {
                onSuccess();
            } else {
                modalHandler.hideModal(modalName);
            }
        },
        onError: (error: RequestError) => {
            notifyError(error.message || 'Erro ao criar tamanho');
        }
    });

    const updateMutation = useMutation({
        mutationFn: (updatedSize: Size) => UpdateSize(updatedSize, data!),
        onSuccess: (_, updatedSize) => {
            queryClient.invalidateQueries({ queryKey: ['sizes', categoryID] });

            notifySuccess(`Tamanho ${updatedSize.name} atualizado com sucesso`);
            if (onSuccess) {
                onSuccess();
            } else {
                modalHandler.hideModal(modalName);
            }
        },
        onError: (error: RequestError) => {
            notifyError(error.message || 'Erro ao atualizar tamanho');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (sizeId: string) => DeleteSize(sizeId, data!),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sizes', categoryID] });

            notifySuccess(`Tamanho ${size.name} removido com sucesso`);
            if (onSuccess) {
                onSuccess();
            } else {
                modalHandler.hideModal(modalName);
            }
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

    const isDefaultCategory = useMemo(() => !category?.is_additional && !category?.is_complement, [category?.is_additional, category?.is_complement]);

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
            <ButtonsModal
                item={size}
                name="Tamanho"
                onSubmit={submit}
                deleteItem={onDelete}
                isPending={createMutation.isPending || updateMutation.isPending || deleteMutation.isPending}
            />
        </div>
    );
};

export default SizeForm;
