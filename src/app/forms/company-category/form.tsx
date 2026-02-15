'use client';

import React, { useState } from 'react';
import ButtonsModal from '../../components/modal/buttons-modal';
import { notifySuccess, notifyError } from '@/app/utils/notifications';
import { useSession } from 'next-auth/react';
import CreateFormsProps from '../create-forms-props';
import DeleteCompanyCategory from '@/app/api/company-category/delete';
import CreateCompanyCategory from '@/app/api/company-category/create';
import UpdateCompanyCategory from '@/app/api/company-category/update';
import { useModal } from '@/app/context/modal/context';
import ErrorForms from '../../components/modal/error-forms';
import RequestError from '@/app/utils/error';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { HiddenField, ImageField, TextField } from '@/app/components/modal/field';
import { CompanyCategory } from '@/app/entities/company/company-category';

const CompanyCategoryForm = ({ item, isUpdate }: CreateFormsProps<CompanyCategory>) => {
    const modalName = isUpdate ? 'edit-company-category-' + item?.id : 'new-company-category';
    const modalHandler = useModal();
    const [category, setCategory] = useState<CompanyCategory>(item || { id: '', name: '', image_path: '' });
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const { data } = useSession();
    const queryClient = useQueryClient();

    const handleInputChange = (field: keyof CompanyCategory, value: any) => {
        setCategory(prev => ({ ...prev, [field]: value }));
    };

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
            notifySuccess(`Categoria ${category.name} removida com sucesso`);
            modalHandler.hideModal(modalName);
        },
        onError: (error: RequestError) => {
            notifyError(error.message || `Erro ao remover categoria ${category.name}`);
        }
    });

    const submit = async () => {
        if (!data) return;

        if (!category.name) {
            setErrors({ name: ['Nome é obrigatório'] });
            return;
        }

        if (!isUpdate) {
            createMutation.mutate(category as CompanyCategory);
        } else {
            updateMutation.mutate(category as CompanyCategory);
        }
    }

    const onDelete = async () => {
        if (!data || !category.id) return;
        deleteMutation.mutate(category.id);
    }

    return (
        <div className="text-black space-y-6">
            <div className="bg-white rounded-lg p-6">
                <div className="space-y-4">
                    <TextField
                        name="name"
                        friendlyName="Nome"
                        placeholder="Digite o nome da categoria"
                        setValue={value => handleInputChange('name', value)}
                        value={category.name}
                    />

                    <ImageField
                        friendlyName='Imagem'
                        name='image_path'
                        setValue={value => handleInputChange('image_path', value)}
                        value={category.image_path || ''}
                        optional
                        onUploadError={(error) => notifyError(error)}
                    />
                </div>
            </div>

            <HiddenField
                name="id"
                setValue={(value) => handleInputChange("id", value)}
                value={category.id}
            />
            <ErrorForms errors={errors} setErrors={setErrors} />

            <div className="mt-6">
                <ButtonsModal
                    item={category}
                    name="Categoria de Cliente"
                    onSubmit={submit}
                    deleteItem={isUpdate ? onDelete : undefined}
                />
            </div>
        </div>
    );
};

export default CompanyCategoryForm;
