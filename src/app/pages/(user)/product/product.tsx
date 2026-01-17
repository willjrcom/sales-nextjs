import ProductForm from "@/app/forms/product/form";
import CrudLayout from "@/app/components/crud/crud-layout";
import PageTitle from '@/app/components/PageTitle';
import CrudTable from "@/app/components/crud/table";
import ProductColumns from "@/app/entities/product/table-columns";
import Refresh, { FormatRefreshTime } from "@/app/components/crud/refresh";
import { FaFilter } from "react-icons/fa";
import ButtonIconTextFloat from "@/app/components/button/button-float";
import { SelectField, CheckboxField } from "@/app/components/modal/field";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { notifyError } from "@/app/utils/notifications";
import GetProducts from "@/app/api/product/product";
import GetCategories from "@/app/api/category/category";

const PageProducts = () => {
    const [categoryID, setCategoryID] = useState("");
    const [showInactive, setShowInactive] = useState(false);
    const { data } = useSession();
    const [lastUpdate, setLastUpdate] = useState(FormatRefreshTime(new Date()));
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

    const { data: categoriesResponse } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            return GetCategories(data!);
        },
        enabled: !!data?.user?.access_token,
    });

    const { isPending, error, data: productsResponse, refetch } = useQuery({
        queryKey: ['products', pagination.pageIndex, pagination.pageSize, showInactive],
        queryFn: async () => {
            setLastUpdate(FormatRefreshTime(new Date()));
            return GetProducts(data!, !showInactive);
        },
        enabled: !!data?.user?.access_token,
    });

    useEffect(() => {
        if (error) notifyError('Erro ao carregar categorias');
    }, [error]);

    const categories = useMemo(() => categoriesResponse?.items || [], [categoriesResponse?.items]);

    const products = useMemo(() => productsResponse?.items || [], [productsResponse?.items]);

    const validProducts = useMemo(() => products
        .filter(product => !categoryID || product.category_id === categoryID)
        .sort((a, b) => a.name.localeCompare(b.name)), [products, categoryID]);

    return (
        <>
            <ButtonIconTextFloat modalName="filter-product" icon={FaFilter}><h1>Filtro</h1></ButtonIconTextFloat>

            <ButtonIconTextFloat modalName="new-product" title="Novo produto" position="bottom-right">
                <ProductForm />
            </ButtonIconTextFloat>

            <CrudLayout title={<PageTitle title="Produtos" tooltip="Cadastro e listagem de produtos disponíveis, filtre por categoria e gerencie detalhes." />}
                searchButtonChildren={
                    <>
                        <SelectField
                            friendlyName="Categoria" name="categoria" selectedValue={categoryID} setSelectedValue={setCategoryID} values={categories} optional />
                        <CheckboxField
                            friendlyName="Mostrar inativos" name="show_inactive" value={showInactive} setValue={setShowInactive} />
                    </>
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
                        columns={ProductColumns()}
                        data={validProducts}
                        totalCount={products.length}
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