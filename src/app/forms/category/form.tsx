'use client';

import React, { useState } from 'react';
import { TextField, HiddenField } from '../../components/modal/field';
import Category, { ValidateCategoryForm } from '@/app/entities/category/category';
import ButtonsModal from '../../components/modal/buttons-modal';
import { useSession } from 'next-auth/react';
import CreateFormsProps from '../create-forms-props';
import DeleteCategory from '@/app/api/category/delete/route';
import { useCategories } from '@/app/context/category/context';
import NewCategory from '@/app/api/category/new/route';
import UpdateCategory from '@/app/api/category/update/route';
import { useModal } from '@/app/context/modal/context';
import ErrorForms from '../../components/modal/error-forms';
import RequestError from '@/app/api/error';

const CategoryForm = ({ item, isUpdate }: CreateFormsProps<Category>) => {
    const modalName = isUpdate ? 'edit-category-' + item?.id : 'new-category'
    const modalHandler = useModal();
    const context = useCategories();
    const [category, setCategory] = useState<Category>(item || new Category());
    const { data } = useSession();
    const [error, setError] = useState<RequestError | null>(null);
    const [errors, setErrors] = useState<Record<string, string[]>>({});

    const handleInputChange = (field: keyof Category, value: any) => {
        setCategory(prev => ({ ...prev, [field]: value }));
    };

    const submit = async () => {
        if (!data) return;

        const validationErrors = ValidateCategoryForm(category);
        if (Object.values(validationErrors).length > 0) return setErrors(validationErrors);

        try {
            const response = isUpdate ? await UpdateCategory(category, data) : await NewCategory(category, data)
            setError(null);

            if (!isUpdate) {
                category.id = response
                context.addItem(category);
            } else {
                context.updateItem(category);
            }

            modalHandler.hideModal(modalName);

        } catch (error) {
            setError(error as RequestError);
        }
    }

    const onDelete = async () => {
        if (!data) return;
        DeleteCategory(category.id, data);
        context.removeItem(category.id)
        modalHandler.hideModal(modalName);
    }

    return (
        <>
            <TextField friendlyName='Nome' name='name' setValue={value => handleInputChange('name', value)} value={category.name} />
            <TextField friendlyName='Imagem' name='image_path' setValue={value => handleInputChange('image_path', value)} value={category.image_path} />
            <HiddenField name='id' setValue={value => handleInputChange('id', value)} value={category.id} />

            {error && <p className="mb-4 text-red-500">{error.message}</p>}
            <ErrorForms errors={errors} />
            <ButtonsModal item={category} name='categoria' onSubmit={submit} deleteItem={onDelete} />
        </>
    );
};

export default CategoryForm;
