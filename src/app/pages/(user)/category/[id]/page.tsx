'use client';

import GetCategoryByID from "@/app/api/category/[id]/route";
import RequestError from "@/app/api/error";
import Category from "@/app/entities/category/category";
import { TextField } from "@/app/components/modal/field";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import Modal from "@/app/components/modal/modal";
import ListSize from "./list-size";
import ListQuantity from "./list-quantity";

const PageCategoryEdit = () => {
    const { id } = useParams();
    const [category, setCategory] = useState<Category | null>();
    const [error, setError] = useState<RequestError | null>(null);
    const { data } = useSession();

    const getCategory = useCallback(async () => {
        if (!id || !data || !!category) return;
        try {
            const categoryFound = await GetCategoryByID(id as string, data);
            setCategory(categoryFound);
            setError(null);
        } catch (error) {
            setError(error as RequestError);
        }
    }, [category, data, id]);

    useEffect(() => {
        getCategory();
    }, [data, getCategory]);


    if (!id || !category) {
        return (
            <h1>Categoria não encontrada</h1>
        )
    }

    return (
        <Modal show={true} title="Editar categoria" withoutBackground>
            <CategoryForm item={category} />
        </Modal>
    );
}

export interface CategoryFormProps {
    item?: Category;
    setItem?: (category: Category) => void
}

const CategoryForm = ({ item }: CategoryFormProps) => {
    const [category, setCategory] = useState<Category>(item || new Category());

    const handleInputChange = (field: keyof Category, value: any) => {
        setCategory(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="flex flex-col items-center justify-center p-4">
            <h1 className="text-3xl font-bold mb-6">Categoria</h1>
            <TextField friendlyName="Nome da Categoria" name="name" placeholder="nome da categoria" setValue={value => handleInputChange('name', value)} value={category.name} />
            <TextField friendlyName="Imagem" name="image_path" placeholder="caminho da imagem" setValue={value => handleInputChange('image_path', value)} value={category.image_path} />

            <ListSize item={category} setItem={setCategory} />
            <ListQuantity item={category} setItem={setCategory} />
        </div>
    );
};






export default PageCategoryEdit