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
        <Modal show={true} title="Editar categoria" withoutBackground>
        <div className="flex flex-col p-6 space-y-6">
            <CategoryForm isUpdate={true} item={category} />

            <hr className="my-4" />

            <div className="bg-white p-4 rounded-lg shadow-sm">
                <ListSize category={category} />
                <ListQuantity category={category} />
            </div>
        </div>
        </Modal>
    );
}

export default PageCategoryEdit