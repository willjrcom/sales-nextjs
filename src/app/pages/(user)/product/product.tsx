import ProductForm from "@/app/forms/product/form";
import CrudLayout from "@/app/components/crud/crud-layout";
import PageTitle from '@/app/components/PageTitle';
import CrudTable from "@/app/components/crud/table";
import ProductColumns from "@/app/entities/product/table-columns";
import Refresh from "@/app/components/crud/refresh";
import { FaFilter } from "react-icons/fa";
import ButtonIconTextFloat from "@/app/components/button/button-float";
import { SelectField } from "@/app/components/modal/field";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { useSession } from "next-auth/react";
import { fetchCategories } from "@/redux/slices/categories";
import Product from "@/app/entities/product/product";

const PageProducts = () => {
    const [categoryID, setCategoryID] = useState("");
    const categoriesSlice = useSelector((state: RootState) => state.categories);
    const [products, setProducts] = useState<Product[]>([]);
    const dispatch = useDispatch<AppDispatch>();
    const { data } = useSession();

    useEffect(() => {
        const token = data?.user?.access_token;
        const hasCategories = categoriesSlice.ids.length > 0;

        if (token && !hasCategories) {
            dispatch(fetchCategories({ session: data }));
        }
    }, [data?.user?.access_token, categoriesSlice.ids.length]);

    // products
    useEffect(() => {
        if (Object.keys(categoriesSlice.entities).length === 0) return;
        const productsByCategories = Object.values(categoriesSlice.entities)
            .map((category) => {
                return category.products?.map(product => {
                    ;
                    return {
                        ...product,
                        category: category,
                    } as Product
                }) || []
            }).flat();

        setProducts(productsByCategories)
    }, [categoriesSlice.entities]);

    if (categoriesSlice.loading) {
        return (
            <h1>Carregando página...</h1>
        )
    }

    const validProducts = products.filter(product => !categoryID || product.category_id === categoryID).sort((a, b) => a.name.localeCompare(b.name));

    return (
        <>
            <ButtonIconTextFloat modalName="filter-product" icon={FaFilter}><h1>Filtro</h1></ButtonIconTextFloat>

            <ButtonIconTextFloat modalName="new-product" title="Novo produto" position="bottom-right">
                <ProductForm />
            </ButtonIconTextFloat>

            <CrudLayout title={<PageTitle title="Produtos" tooltip="Cadastro e listagem de produtos disponíveis, filtre por categoria e gerencie detalhes." />}
                searchButtonChildren={
                    <SelectField
                        friendlyName="Categoria" name="categoria" selectedValue={categoryID} setSelectedValue={setCategoryID} values={Object.values(categoriesSlice.entities)} optional />
                }
                refreshButton={
                    <Refresh
                        slice={categoriesSlice}
                        fetchItems={fetchCategories}
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