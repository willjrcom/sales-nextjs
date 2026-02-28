'use client';

import GetCategoryByID from "@/app/api/category/[id]/category";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import CategoryForm from "@/app/forms/category/form";

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

const PageCategoryEdit = () => {
    const { id } = useParams();
    const { data: session } = useSession();

    const { isLoading, data: category } = useQuery({
        queryKey: ['category', id],
        queryFn: () => GetCategoryByID(session!, id as string),
        enabled: !!id && !!session,
    });


    return (
        <div>
            <Breadcrumb className="mb-4">
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/pages/product?tab=categories">Categorias</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        {isLoading ? <Skeleton className="h-6 w-24" /> : <BreadcrumbPage>{category?.name}</BreadcrumbPage>}
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            {isLoading ? <Skeleton className="h-6 w-24" /> : <CategoryForm isUpdate={true} item={category} />}
        </div>
    );
}

export default PageCategoryEdit