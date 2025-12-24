'use client';

import CategoryForm from "@/app/forms/category/form";
import CrudLayout from "@/app/components/crud/crud-layout";
import PageTitle from '@/app/components/PageTitle';
import CrudTable from "@/app/components/crud/table";
import CategoryColumns from "@/app/entities/category/table-columns";
import Refresh, { FormatRefreshTime } from "@/app/components/crud/refresh";
import { FaFilter } from "react-icons/fa";
import ButtonIconTextFloat from "@/app/components/button/button-float";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import "./style.css";
import { useQuery } from "@tanstack/react-query";
import GetCategories from "@/app/api/category/category";
import { notifyError } from "@/app/utils/notifications";

const PageCategories = () => {
    const { data } = useSession();
    const [lastUpdate, setLastUpdate] = useState<string>(FormatRefreshTime(new Date()));

    const { isPending, error, data: categoriesResponse, refetch } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            setLastUpdate(FormatRefreshTime(new Date()));
            return GetCategories(data!);
        },
        enabled: !!data?.user?.access_token,
    });

    useEffect(() => {
        if (error) notifyError('Erro ao carregar categorias');
    }, [error]);

    const categories = useMemo(() => categoriesResponse?.items || [], [categoriesResponse?.items]);
    const categoriesSorted = useMemo(() => categories.sort((a, b) => a.name.localeCompare(b.name)), [categories]);

    return (
        <>
            <ButtonIconTextFloat modalName="filter-category" icon={FaFilter}><h1>Filtro</h1></ButtonIconTextFloat>

            <ButtonIconTextFloat title="Nova categoria" modalName="new-category" position="bottom-right">
                <CategoryForm />
            </ButtonIconTextFloat>

            <CrudLayout title={<PageTitle title="Categorias" tooltip="Gerencie categorias de produtos, permitindo adicionar, editar ou remover." />}
                refreshButton={
                    <Refresh
                        onRefresh={refetch}
                        isPending={isPending}
                        lastUpdate={lastUpdate}
                    />
                }
                tableChildren={
                    <CrudTable
                        columns={CategoryColumns()}
                        data={categoriesSorted}>
                    </CrudTable>
                }
            />
        </>
    )
}
export default PageCategories;