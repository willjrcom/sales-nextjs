'use client';

import GetCategoryByID from "@/app/api/category/[id]/category";
import PageTitle from '@/app/components/PageTitle';
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import ListSize from "../../../../../forms/category/list-size";
import ListQuantity from "../../../../../forms/category/list-quantity";
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

const PageCategoryEdit = () => {
    const { id } = useParams();
    const { data: session } = useSession();

    const { data: category } = useQuery({
        queryKey: ['category', id],
        queryFn: () => GetCategoryByID(id as string, session!),
        enabled: !!id && !!session,
    });

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

            <ButtonIconTextFloat title="Tamanhos e quantidades" modalName="edit-size-and-quantity" size="xl" icon={FaEdit} position="bottom-right">
                <ListSize category={category} />
                <ListQuantity category={category} />
            </ButtonIconTextFloat>
        </div>
    );
}

export default PageCategoryEdit