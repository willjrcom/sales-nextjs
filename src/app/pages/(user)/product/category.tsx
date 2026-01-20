'use client';

import { CheckboxField } from "@/app/components/modal/field";

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
import { useQuery } from "@tanstack/react-query";
import GetCategories from "@/app/api/category/category";
import { notifyError } from "@/app/utils/notifications";

const PageCategories = () => {
    const { data } = useSession();
    const [showInactive, setShowInactive] = useState(false);
    const [lastUpdate, setLastUpdate] = useState<string>(FormatRefreshTime(new Date()));
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

    const { isPending, error, data: categoriesResponse, refetch } = useQuery({
        queryKey: ['categories', pagination.pageIndex, pagination.pageSize, !showInactive],
        queryFn: async () => {
            setLastUpdate(FormatRefreshTime(new Date()));
            return GetCategories(data!, pagination.pageIndex, pagination.pageSize, !showInactive);
        },
        enabled: !!data?.user?.access_token,
    });

    useEffect(() => {
        if (error) notifyError('Erro ao carregar categorias');
    }, [error]);

    const categories = useMemo(() => categoriesResponse?.items || [], [categoriesResponse?.items]);
    const categoriesSorted = useMemo(() => categories
        .sort((a, b) => a.name.localeCompare(b.name)), [categories]);

    return (
        <>
            {/* <ButtonIconTextFloat modalName="filter-category" icon={FaFilter}><h1>Filtro</h1></ButtonIconTextFloat> */}

            <ButtonIconTextFloat title="Nova categoria" modalName="new-category" position="bottom-right">
                <CategoryForm />
            </ButtonIconTextFloat>

            <CrudLayout title={<PageTitle title="Categorias" tooltip="Gerencie categorias de produtos, permitindo adicionar, editar ou remover." />}
                searchButtonChildren={
                    <CheckboxField friendlyName="Mostrar inativos" name="show_inactive" value={showInactive} setValue={setShowInactive} />
                }
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
                        data={categoriesSorted}
                        totalCount={categories.length}
                        onPageChange={(pageIndex, pageSize) => {
                            setPagination({ pageIndex, pageSize });
                        }}
                    />
                }
            />
        </>
    )
}
export default PageCategories;