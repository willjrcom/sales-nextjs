'use client';

import React, { Dispatch, SetStateAction, useState } from 'react';
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
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/redux/store';
import { updateCategory } from '@/redux/slices/categories';

interface SizeFormProps extends CreateFormsProps<Size> {
    category: Category;
    setCategory: Dispatch<SetStateAction<Category | null>>;
}

const SizeForm = ({ item, isUpdate, category, setCategory }: SizeFormProps) => {
    const modalName = isUpdate ? 'edit-size-' + item?.id : 'new-size'
    const modalHandler = useModal();
    const dispatch = useDispatch<AppDispatch>();
    const [size, setSize] = useState<Size>(item || new Size());
    const { data } = useSession();
    const [errors, setErrors] = useState<Record<string, string[]>>({});

    const handleInputChange = (field: keyof Size, value: any) => {
        setSize(prev => ({ ...prev, [field]: value }));
    };

    const syncCategorySizes = (builder: (prevSizes: Size[]) => Size[]) => {
        let computed: Size[] | null = null;
        setCategory(prev => {
            if (!prev) return prev;
            const nextSizes = builder(prev.sizes ?? []);
            computed = nextSizes;
            return { ...prev, sizes: nextSizes };
        });
        return computed;
    };

    const submit = async () => {
        if (!data || !category) return;

        size.category_id = category.id

        const validationErrors = ValidateSizeForm(size);
        if (Object.values(validationErrors).length > 0) return setErrors(validationErrors);

        try {
            const response = isUpdate ? await UpdateSize(size, data) : await NewSize(size, data)

            let nextSizes: Size[] | null = null;
            if (isUpdate) {
                const updatedSize = { ...size };
                nextSizes = syncCategorySizes(prev => prev.map(s => s.id === updatedSize.id ? updatedSize : s));
                notifySuccess(`Tamanho ${updatedSize.name} atualizado com sucesso`);
            } else {
                const createdSize = { ...size, id: response };
                nextSizes = syncCategorySizes(prev => [...prev, createdSize]);
                notifySuccess(`Tamanho ${createdSize.name} criado com sucesso`);
            }

            if (nextSizes) {
                dispatch(updateCategory({ type: "UPDATE", payload: { id: category.id, changes: { sizes: [...nextSizes] } } }));
            }

            modalHandler.hideModal(modalName);

        } catch (error: RequestError | any) {
            notifyError(error.message || 'Erro ao salvar tamanho');
        }
    }

    const onDelete = async () => {
        if (!data) return;

        try {
            await DeleteSize(size.id, data);

            const nextSizes = syncCategorySizes(prev => prev.filter(q => q.id !== size.id));
            if (nextSizes) {
                dispatch(updateCategory({ type: "UPDATE", payload: { id: category.id, changes: { sizes: [...nextSizes] } } }));
            }
            modalHandler.hideModal(modalName);
            notifySuccess(`Tamanho ${size.name} removido com sucesso`);
        } catch (error: RequestError | any) {
            notifyError(error.message || 'Erro ao remover tamanho');
        }
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
