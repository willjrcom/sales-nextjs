'use client';

import GetCategoryByID from "@/app/api/category/[id]/route";
import RequestError from "@/app/api/error";
import Category from "@/app/entities/category/category";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import Modal from "@/app/components/modal/modal";
import ListSize from "../../../../forms/category/list-size";
import ListQuantity from "../../../../forms/category/list-quantity";
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
    }, [data, getCategory]);


    if (!id || !category) {
        return (
            <h1>Categoria não encontrada</h1>
        )
    }

    return (
        <div className="flex items-center justify-between">
            <div className=" w-[80vw]">
            <CategoryForm isUpdate={true} item={category} setItem={setCategory} />

            <hr className="my-4" />

            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <ListSize category={category} />
                <ListQuantity category={category} />
            </div>
            </div>
        </div>
    );
}

export default PageCategoryEdit