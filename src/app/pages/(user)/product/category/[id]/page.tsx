'use client';

import GetCategoryByID from "@/app/api/category/[id]/category";
import RequestError from "@/app/utils/error";
import Category from "@/app/entities/category/category";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import ListSize from "../../../../../forms/category/list-size";
import ListQuantity from "../../../../../forms/category/list-quantity";
import CategoryForm from "@/app/forms/category/form";

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
    }, [data?.user.id_token, getCategory]);


    if (!id || !category) {
        return (
            <h1>Categoria não encontrada</h1>
        )
    }

    return (
        <div className="flex items-center justify-between">
            {error && <p className="text-red-500">{error.message}</p>}
            <div className=" w-[80vw]">
                <CategoryForm isUpdate={true} item={category} setItem={setCategory} />

                <hr className="my-4" />

                <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                    <h2 className="text-lg font-semibold mb-4">Cadastros relacionados</h2>
                    <ListSize category={category} />
                    <ListQuantity category={category} />
                </div>
            </div>
        </div>
    );
}

export default PageCategoryEdit