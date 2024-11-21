import React, { useState } from 'react';
import { TextField, HiddenField } from '../field';
import Category from '@/app/entities/category/category';
import ButtonsModal from '../buttons-modal';
import { useSession } from 'next-auth/react';
import CreateFormsProps from '../create-forms-props';
import DeleteCategory from '@/app/api/category/delete/route';

const CategoryForm = ({ handleCloseModal, onSubmit, item, context }: CreateFormsProps<Category>) => {
    const category = item || new Category();
    const [id, setId] = useState(category.id);
    const [name, setName] = useState(category.name);
    const [imagePath, setImagePath] = useState(category.image_path);
    const { data } = useSession();
    const [error, setError] = useState<string | null>(null);
    
    const submit = async () => {
        if (!data) return;

        category.id = id;
        category.name = name;
        category.image_path = imagePath

        try {
            const response = await onSubmit(category, data)
    
            if (response) {
                handleCloseModal();
                context.addItem(category);
            }

        } catch (error) {
            setError((error as Error).message);
        }
    }

    const onDelete = async () => {
        if (!data) return;
        DeleteCategory(category.id, data);
        handleCloseModal();
        context.removeItem(category.id)
    }

    return (
        <>
            {error && <p className="mb-4 text-red-500">{error}</p>}
            <TextField friendlyName='Nome' name='name' setValue={setName} value={name}/>
            <TextField friendlyName='Imagem' name='imagePath' setValue={setImagePath} value={imagePath}/>
            <HiddenField name='id' setValue={setId} value={id}/>

            {error && <p className="mb-4 text-red-500">{error}</p>}
            <ButtonsModal isUpdate={category.id !== ''} onSubmit={submit} onDelete={onDelete} onCancel={handleCloseModal}/>
        </>
    );
};

export default CategoryForm;
