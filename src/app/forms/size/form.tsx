'use client';

import React, { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TextField, CheckboxField } from '../../components/modal/field';
import Size, { SchemaSize } from '@/app/entities/size/size';
import { notifyError, notifySuccess } from '@/app/utils/notifications';
import ButtonsModal from '../../components/modal/buttons-modal';
import { useSession } from 'next-auth/react';
import CreateFormsProps from '../create-forms-props';
import DeleteSize from '@/app/api/size/delete/size';
import NewSize from '@/app/api/size/new/size';
import UpdateSize from '@/app/api/size/update/size';
import { useModal } from '@/app/context/modal/context';
import RequestError from '@/app/utils/error';
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
    const { data: session } = useSession();
    const [isSaving, setIsSaving] = useState(false);

    const initialValues = useMemo(() => {
        const s = new Size(item);
        return {
            id: s.id,
            name: s.name,
            is_active: s.is_active,
            category_id: categoryID || s.category_id,
        }
    }, [item, categoryID]);

    const {
        handleSubmit,
        setValue,
        watch,
        formState: { errors }
    } = useForm<any>({
        resolver: zodResolver(SchemaSize),
        defaultValues: initialValues
    });

    const size = watch();

    const { data: category } = useQuery({
        queryKey: ['category', categoryID],
        queryFn: () => GetCategoryByID(session as any, categoryID),
        enabled: !!(session as any)?.user?.access_token && !!categoryID,
    });

    const onInvalid = () => {
        notifyError('Verifique os campos obrigatórios');
    };

    const createMutation = useMutation({
        mutationFn: (newSize: Size) => NewSize(newSize, session!),
        onSuccess: (response, newSize) => {
            newSize.id = response;
            queryClient.invalidateQueries({ queryKey: ['sizes', categoryID] });
            notifySuccess(`Tamanho ${newSize.name} criado com sucesso`);
            if (onSuccess) onSuccess(); else modalHandler.hideModal(modalName);
        },
        onError: (error: RequestError) => {
            notifyError(error.message || 'Erro ao criar tamanho');
        },
        onSettled: () => setIsSaving(false)
    });

    const updateMutation = useMutation({
        mutationFn: (updatedSize: Size) => UpdateSize(updatedSize, session!),
        onSuccess: (_, updatedSize) => {
            queryClient.invalidateQueries({ queryKey: ['sizes', categoryID] });
            notifySuccess(`Tamanho ${updatedSize.name} atualizado com sucesso`);
            if (onSuccess) onSuccess(); else modalHandler.hideModal(modalName);
        },
        onError: (error: RequestError) => {
            notifyError(error.message || 'Erro ao atualizar tamanho');
        },
        onSettled: () => setIsSaving(false)
    });

    const deleteMutation = useMutation({
        mutationFn: (sizeId: string) => DeleteSize(sizeId, session!),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sizes', categoryID] });
            notifySuccess(`Tamanho ${size.name} removido com sucesso`);
            if (onSuccess) onSuccess(); else modalHandler.hideModal(modalName);
        },
        onError: (error: RequestError) => {
            notifyError(error.message || `Erro ao remover tamanho ${size.name}`);
        },
        onSettled: () => setIsSaving(false)
    });

    const submit = async (formData: any) => {
        if (!session || !category) return;
        setIsSaving(true);
        const sizeToSave = new Size(formData);
        sizeToSave.category_id = category.id;

        if (isUpdate) {
            updateMutation.mutate(sizeToSave);
        } else {
            createMutation.mutate(sizeToSave);
        }
    }

    const onDelete = async () => {
        if (!session || !size.id) return;
        setIsSaving(true);
        deleteMutation.mutate(size.id);
    }

    const isDefaultCategory = useMemo(() => !category?.is_additional && !category?.is_complement, [category?.is_additional, category?.is_complement]);

    return (
        <div className="text-black space-y-6">
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-lg shadow-sm border border-gray-100 p-6 transition-all duration-300 hover:shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Informações do Tamanho</h3>
                <div className="space-y-4">
                    <div className="transform transition-transform duration-200 hover:scale-[1.01]">
                        <TextField friendlyName='Nome' name='name' setValue={(value: any) => setValue('name', value)} value={size.name} error={errors.name?.message as string} />
                    </div>
                    {isDefaultCategory && (
                        <div className="transform transition-transform duration-200 hover:scale-[1.01]">
                            <CheckboxField friendlyName='Disponível' name='is_active' setValue={(value: any) => setValue('is_active', value)} value={size.is_active} error={errors.is_active?.message as string} />
                        </div>
                    )}
                </div>
            </div>

            <ButtonsModal
                item={size}
                name="Tamanho"
                onSubmit={handleSubmit(submit, onInvalid)}
                deleteItem={onDelete}
                isPending={isSaving}
            />
        </div>
    );
};

export default SizeForm;
