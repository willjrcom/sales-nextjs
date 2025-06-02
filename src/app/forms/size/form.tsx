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

interface SizeFormProps extends CreateFormsProps<Size> {
    category: Category
}

const SizeForm = ({ item, isUpdate, category }: SizeFormProps) => {
    const modalName = isUpdate ? 'edit-size-' + item?.id : 'new-size'
    const modalHandler = useModal();
    const [size, setSize] = useState<Size>(item || new Size());
    const { data } = useSession();
    const [errors, setErrors] = useState<Record<string, string[]>>({});

    const handleInputChange = (field: keyof Size, value: any) => {
        setSize(prev => ({ ...prev, [field]: value }));
    };

    const submit = async () => {
        if (!data || !category) return;

        size.category_id = category.id

        const validationErrors = ValidateSizeForm(size);
        if (Object.values(validationErrors).length > 0) return setErrors(validationErrors);

        try {
            const response = isUpdate ? await UpdateSize(size, data) : await NewSize(size, data)

            if (isUpdate) {
                const index = category.sizes.findIndex(s => s.id === size.id);
                if (index !== -1) {
                    category.sizes[index] = size;
                }
                notifySuccess(`Tamanho ${size.name} atualizado com sucesso`);
            } else {
                size.id = response;
                category.sizes.push(size);
                notifySuccess(`Tamanho ${size.name} criado com sucesso`);
            }

            modalHandler.hideModal(modalName);

        } catch (error: RequestError | any) {
            notifyError(error.message || 'Erro ao salvar tamanho');
        }
    }

    const onDelete = async () => {
        if (!data) return;
        DeleteSize(size.id, data);

        if (category) {
            category.sizes = category.sizes.filter(q => q.id !== size.id);
        }

        modalHandler.hideModal(modalName);
        notifySuccess(`Tamanho ${size.name} removido com sucesso`);
    }

    const isDefaultCategory = !category.is_additional && !category.is_complement;

    return (
        <>
            <TextField friendlyName='Nome' name='name' setValue={value => handleInputChange('name', value)} value={size.name} />

            {isDefaultCategory && <CheckboxField friendlyName='Disponivel' name='is_active' setValue={value => handleInputChange('is_active', value)} value={size.is_active} />}

            <HiddenField name='id' setValue={value => handleInputChange('id', value)} value={size.id} />

            <HiddenField name='category_id' setValue={value => handleInputChange('category_id', value)} value={category?.id} />

            <ErrorForms errors={errors} />
            {isDefaultCategory && <ButtonsModal item={size} name="Tamanho" onSubmit={submit} deleteItem={onDelete} />}
            {!isDefaultCategory && <ButtonsModal item={size} name="Tamanho" onSubmit={submit} />}
        </>
    );
};

export default SizeForm;
