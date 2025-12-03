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
import ButtonIconTextFloat from "@/app/components/button/button-float";
import { FaEdit } from "react-icons/fa";

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

            <ButtonIconTextFloat title="Tamanhos e quantidades" modalName="edit-size-and-quantity" size="xl" icon={FaEdit} position="bottom-right">
                <ListSize category={category} setCategory={setCategory} />
                <ListQuantity category={category} setCategory={setCategory} />
            </ButtonIconTextFloat>
        </div>
    );
}

export default PageCategoryEdit