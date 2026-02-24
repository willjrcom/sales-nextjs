'use client';

import React from 'react';
import ButtonsModal from '../../components/modal/buttons-modal';
import { notifySuccess, notifyError } from '@/app/utils/notifications';
import { useSession } from 'next-auth/react';
import CreateFormsProps from '../create-forms-props';
import DeleteCompanyCategory from '@/app/api/company-category/delete';
import CreateCompanyCategory from '@/app/api/company-category/create';
import UpdateCompanyCategory from '@/app/api/company-category/update';
import { useModal } from '@/app/context/modal/context';
import RequestError from '@/app/utils/error';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { HiddenField, ImageField, TextField } from '@/app/components/modal/field';
import { CompanyCategory, CompanyCategoryFormData, SchemaCompanyCategory } from '@/app/entities/company/company-category';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const CompanyCategoryForm = ({ item, isUpdate }: CreateFormsProps<CompanyCategory>) => {
    const modalName = isUpdate ? 'edit-company-category-' + item?.id : 'new-company-category';
    const modalHandler = useModal();
    const { data } = useSession();
    const queryClient = useQueryClient();

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isSubmitting }
    } = useForm<CompanyCategoryFormData>({
        resolver: zodResolver(SchemaCompanyCategory),
        defaultValues: {
            name: item?.name || '',
            image_path: item?.image_path || '',
        }
    });

    const createMutation = useMutation({
        mutationFn: (newCategory: CompanyCategory) => CreateCompanyCategory(newCategory, data!),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ['public-company-categories'] });
            notifySuccess(`Categoria ${response.name} criada com sucesso`);
            modalHandler.hideModal(modalName);
        },
        onError: (error: RequestError) => {
            notifyError(error.message || 'Erro ao criar categoria');
        }
    });

    const updateMutation = useMutation({
        mutationFn: (updatedCategory: CompanyCategory) => UpdateCompanyCategory(updatedCategory, data!),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ['public-company-categories'] });
            notifySuccess(`Categoria ${response.name} atualizada com sucesso`);
            modalHandler.hideModal(modalName);
        },
        onError: (error: RequestError) => {
            notifyError(error.message || 'Erro ao atualizar categoria');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (categoryId: string) => DeleteCompanyCategory(categoryId, data!),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['public-company-categories'] });
            notifySuccess(`Categoria ${item?.name} removida com sucesso`);
            modalHandler.hideModal(modalName);
        },
        onError: (error: RequestError) => {
            notifyError(error.message || `Erro ao remover categoria ${item?.name}`);
        }
    });

    const onSubmit = (formData: CompanyCategoryFormData) => {
        if (!data) return;

        const categoryPayload = {
            id: item?.id || '',
            ...formData,
        } as CompanyCategory;

        if (!isUpdate) {
            createMutation.mutate(categoryPayload);
        } else {
            updateMutation.mutate(categoryPayload);
        }
    }

    const onDelete = async () => {
        if (!data || !item?.id) return;
        deleteMutation.mutate(item.id);
    }

    return (
        <div className="text-black space-y-6">
            <div className="bg-white rounded-lg p-6">
                <div className="space-y-4">
                    <TextField
                        name="name"
                        friendlyName="Nome"
                        placeholder="Digite o nome da categoria"
                        setValue={value => setValue('name', value)}
                        value={watch('name')}
                        error={errors.name?.message}
                    />

                    <ImageField
                        friendlyName='Imagem'
                        name='image_path'
                        setValue={value => setValue('image_path', value || '')}
                        value={watch('image_path') || ''}
                        optional
                        onUploadError={(error) => notifyError(error)}
                    />
                </div>
            </div>

            <div className="mt-6">
                <ButtonsModal
                    item={item || { id: '', name: '', image_path: '' }}
                    name="Categoria de Cliente"
                    onSubmit={handleSubmit(onSubmit)}
                    deleteItem={isUpdate ? onDelete : undefined}
                    isPending={createMutation.isPending || updateMutation.isPending || deleteMutation.isPending || isSubmitting}
                />
            </div>
        </div>
    );
};

export default CompanyCategoryForm;
