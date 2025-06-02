'use client';

import GetCategoryByID from "@/app/api/category/[id]/category";
import PageTitle from '@/app/components/PageTitle';
import RequestError from "@/app/utils/error";
import Category from "@/app/entities/category/category";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import ListSize from "../../../../../forms/category/list-size";
import ListQuantity from "../../../../../forms/category/list-quantity";
import CategoryForm from "@/app/forms/category/form";
import { notifyError } from "@/app/utils/notifications";

const PageCategoryEdit = () => {
    const { id } = useParams();
    const [category, setCategory] = useState<Category | null>();
    const { data } = useSession();

    const getCategory = useCallback(async () => {
        if (!id || !data || !!category) return;
        try {
            const categoryFound = await GetCategoryByID(id as string, data);
            setCategory(categoryFound);
        } catch (error: RequestError | any) {
            notifyError(error.message || "Erro ao buscar categoria");
        }
    }, [category, data, id]);

    useEffect(() => {
        getCategory();
    }, [data?.user.access_token, getCategory]);


    if (!id || !category) {
        return (
            <PageTitle title="Categoria não encontrada" tooltip="Verifique o ID da categoria e tente novamente." />
        )
    }

    return (
        <div >
            <CategoryForm isUpdate={true} item={category} setItem={setCategory} />

            <hr className="my-4" />

            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h2 className="text-lg font-semibold mb-4">Cadastros relacionados</h2>
                <ListSize category={category} />
                <ListQuantity category={category} />
            </div>
        </div>
    );
}

export default PageCategoryEdit