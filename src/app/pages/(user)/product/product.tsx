import ProductForm from "@/app/forms/product/form";
import CrudLayout from "@/app/components/crud/crud-layout";
import PageTitle from '@/app/components/ui/page-title';
import CrudTable from "@/app/components/crud/table";
import ProductColumns from "@/app/entities/product/table-columns";
import Refresh, { FormatRefreshTime } from "@/app/components/crud/refresh";
import ButtonIconTextFloat from "@/app/components/button/button-float";
import { SelectField, CheckboxField } from "@/app/components/modal/field";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { notifyError } from "@/app/utils/notifications";
import GetProducts from "@/app/api/product/product";
import { GetCategoriesMap } from "@/app/api/category/category";
import { useUser } from "@/app/context/user-context";
import AccessDenied from "@/app/components/access-denied";

const PageProducts = () => {
    const [categoryID, setCategoryID] = useState("");
    const [showInactive, setShowInactive] = useState(false);
    const { data } = useSession();
    const [lastUpdate, setLastUpdate] = useState(FormatRefreshTime(new Date()));
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
    const { hasPermission, user } = useUser();

    const { data: categoriesResponse } = useQuery({
        queryKey: ['categories', 'map', 'product'],
        queryFn: () => GetCategoriesMap(data!, true),
        enabled: !!data?.user?.access_token,
        refetchInterval: 60000,
    });

    const { isPending, error, data: productsResponse, refetch } = useQuery({
        queryKey: ['products', pagination.pageIndex, pagination.pageSize, !showInactive],
        queryFn: async () => {
            setLastUpdate(FormatRefreshTime(new Date()));
            return GetProducts(data!, pagination.pageIndex, pagination.pageSize, !showInactive);
        },
        enabled: !!data?.user?.access_token,
        placeholderData: keepPreviousData,
    });

    useEffect(() => {
        if (error) notifyError('Erro ao carregar categorias');
    }, [error]);


    if (!user) {
        return <AccessDenied message="Usuário não encontrado ou sessão expirada." />;
    }

    if (!hasPermission('product')) {
        return <AccessDenied />
    }

    const categories = useMemo(() => categoriesResponse || [], [categoriesResponse]);

    const products = useMemo(() => productsResponse?.items || [], [productsResponse?.items]);

    const validProducts = useMemo(() => products
        .filter(product => !categoryID || product.category_id === categoryID)
        .sort((a, b) => a.name.localeCompare(b.name)), [products, categoryID]);

    const totalCount = useMemo(() => parseInt(productsResponse?.headers.get('X-Total-Count') || '0'), [productsResponse?.items]);

    return (
        <>
            {/* <ButtonIconTextFloat modalName="filter-product" icon={FaFilter}><h1>Filtro</h1></ButtonIconTextFloat> */}

            <ButtonIconTextFloat modalName="new-product" title="Novo produto" position="bottom-right">
                <ProductForm />
            </ButtonIconTextFloat>

            <CrudLayout title={<PageTitle title="Produtos" tooltip="Cadastro e listagem de produtos disponíveis, filtre por categoria e gerencie detalhes." />}
                searchButtonChildren={
                    <div className="flex gap-2">
                        <SelectField
                            friendlyName="Categoria" name="categoria" selectedValue={categoryID} setSelectedValue={setCategoryID} values={categories} optional />
                        <CheckboxField
                            friendlyName="Mostrar inativos" name="show_inactive" value={showInactive} setValue={setShowInactive} />
                    </div>
                }
                refreshButton={
                    < Refresh
                        onRefresh={refetch}
                        isPending={isPending}
                        lastUpdate={lastUpdate}
                    />
                }
                tableChildren={
                    < CrudTable
                        columns={ProductColumns()}
                        data={validProducts}
                        totalCount={totalCount}
                        onPageChange={(pageIndex, pageSize) => {
                            setPagination({ pageIndex, pageSize });
                        }}
                    />
                }
            />
        </>
    )
}
export default PageProducts;