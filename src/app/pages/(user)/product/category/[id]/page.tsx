'use client';

import GetCategoryByID from "@/app/api/category/[id]/category";
import PageTitle from '@/app/components/ui/page-title';
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import ListSize from "../../../../../forms/category/list-size";
import CategoryForm from "@/app/forms/category/form";
import ButtonIconTextFloat from "@/app/components/button/button-float";
import { FaEdit } from "react-icons/fa";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

const PageCategoryEdit = () => {
    const { id } = useParams();
    const { data: session } = useSession();

    const { data: category } = useQuery({
        queryKey: ['category', id],
        queryFn: () => GetCategoryByID(session!, id as string),
        enabled: !!id && !!session,
    });

    const isDefaultCategory = useMemo(() => !category?.is_additional && !category?.is_complement, [category?.is_additional, category?.is_complement]);

    if (!id || !category) {
        return (
            <PageTitle title="Categoria não encontrada" tooltip="Verifique o ID da categoria e tente novamente." />
        )
    }

    return (
        <div>
            <Breadcrumb className="mb-4">
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/pages/product?tab=categories">Categorias</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>{category.name}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <CategoryForm isUpdate={true} item={category} />
        </div>
    );
}

export default PageCategoryEdit