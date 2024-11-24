'use client';

import GetCategoryByID from "@/app/api/category/[id]/route";
import ButtonPlus from "@/app/components/crud/button-plus";
import Menu from "@/app/components/menu/layout";
import Category from "@/app/entities/category/category";
import Order from "@/app/entities/order/order";
import Quantity from "@/app/entities/quantity/quantity";
import Size from "@/app/entities/size/size";
import { TextField } from "@/app/forms/field";
import Modal from "@/app/forms/form";
import QuantityForm from "@/app/forms/quantity/form";
import SizeForm from "@/app/forms/size/form";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const PageCategoryEdit = () => {
    return (
        <Menu><Page /></Menu>
    )
}

const Page = () => {
    const { id } = useParams();
    const [category, setCategory] = useState<Category | null>();
    const { data } = useSession();

    useEffect(() => {
        getCategory();
    }, [data]);

    const getCategory = async () => {
        if (!id || !data || !!category) return;
        const categoryFound = await GetCategoryByID(id as string, data);
        setCategory(categoryFound);
    }

    if (!id || !category) {
        return (
            <h1>Categoria não encontrada</h1>
        )
    }

    return (
        <div className="flex items-center justify-center h-[80vh] bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-lg w-[600px]">
                <CategoryForm item={category} />
            </div>
        </div>
    );
}

interface CategoryFormProps {
    item?: Category;
}

const CategoryForm = ({ item }: CategoryFormProps) => {
    const category = item || new Category();
    const [name, setName] = useState(category.name);
    const [imagePath, setImagePath] = useState(category.image_path);
    const [sizes, setSizes] = useState<Size[]>(category.sizes);
    const [quantities, setQuantities] = useState<Quantity[]>(category.quantities);

    return (
        <div className="flex flex-col items-center justify-center p-4">
            <h1 className="text-3xl font-bold mb-6">Categoria</h1>
            <TextField friendlyName="Nome da Categoria" name="name" placeholder="nome da categoria" setValue={setName} value={name} />
            <TextField friendlyName="Imagem" name="image_path" placeholder="caminho da imagem" setValue={setImagePath} value={imagePath} />

            <ListSize item={category} />
            <ListQuantity item={category} />
        </div>
    );
};


const ListSize = ({ item }: CategoryFormProps) => {
    if (item?.sizes === undefined || item?.sizes.length === 0) item!.sizes = [];

    return (
        <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Tamanhos</h2>
            <div className="flex items-center space-x-4">
                {item?.sizes.map((size, index) => (
                    <div
                        key={index}
                        className="border p-2 rounded-md text-center bg-white w-16"
                    >
                        {size.name}
                    </div>
                ))}
                <ButtonPlus name="tamanho">
                    <SizeForm categoryID={item!.id}/>
                </ButtonPlus>
            </div>
        </div>
    )
}

const ListQuantity = ({ item }: CategoryFormProps) => {
    if (item?.quantities === undefined || item?.quantities?.length === 0) item!.quantities = [];

    return (
        <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Quantidades</h2>
            <div className="flex items-center space-x-4">
                {item?.quantities.map((quantity, index) => (
                    <div
                        key={index}
                        className="border p-2 rounded-md text-center bg-white w-16"
                    >
                        {quantity.quantity}
                    </div>
                ))}
                <ButtonPlus name="quantidade">
                    <QuantityForm categoryID={item!.id}/>
                </ButtonPlus>
            </div>
        </div>
    )
}

export default PageCategoryEdit