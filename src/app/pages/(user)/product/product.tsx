import ProductForm from "@/app/forms/product/form";
import CrudLayout from "@/app/components/crud/crud-layout";
import PageTitle from '@/app/components/PageTitle';
import CrudTable from "@/app/components/crud/table";
import ProductColumns from "@/app/entities/product/table-columns";
import Refresh, { FormatRefreshTime } from "@/app/components/crud/refresh";
import { FaFilter } from "react-icons/fa";
import ButtonIconTextFloat from "@/app/components/button/button-float";
import { SelectField } from "@/app/components/modal/field";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import Product from "@/app/entities/product/product";
import { useQuery } from "@tanstack/react-query";
import GetCategories from "@/app/api/category/category";
import { notifyError } from "@/app/utils/notifications";

const PageProducts = () => {
    const [categoryID, setCategoryID] = useState("");
    const { data } = useSession();
    const [lastUpdate, setLastUpdate] = useState(FormatRefreshTime(new Date()));

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
    const productsByCategories = useMemo(() => {
        return categories.map((category) => {
            return category.products?.map(product => {
                return {
                    ...product,
                    category: category,
                } as Product
            }) || []
        }).flat();
    }, [categories]);

    const validProducts = useMemo(() => productsByCategories.filter(product => !categoryID || product.category_id === categoryID).sort((a, b) => a.name.localeCompare(b.name)), [productsByCategories, categoryID]);

    return (
        <>
            <ButtonIconTextFloat modalName="filter-product" icon={FaFilter}><h1>Filtro</h1></ButtonIconTextFloat>

            <ButtonIconTextFloat modalName="new-product" title="Novo produto" position="bottom-right">
                <ProductForm />
            </ButtonIconTextFloat>

            <CrudLayout title={<PageTitle title="Produtos" tooltip="Cadastro e listagem de produtos disponíveis, filtre por categoria e gerencie detalhes." />}
                searchButtonChildren={
                    <SelectField
                        friendlyName="Categoria" name="categoria" selectedValue={categoryID} setSelectedValue={setCategoryID} values={categories} optional />
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
                        data={validProducts}>
                    </CrudTable>
                }
            />
        </>
    )
}
export default PageProducts;