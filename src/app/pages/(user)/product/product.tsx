import ProductForm from "@/app/forms/product/form";
import CrudLayout from "@/app/components/crud/layout";
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
import { fetchProducts } from "@/redux/slices/products";

const PageProducts = () => {
    const [categoryID, setCategoryID] = useState("");
    const categoriesSlice = useSelector((state: RootState) => state.categories);
    const productsSlice = useSelector((state: RootState) => state.products);
    const dispatch = useDispatch<AppDispatch>();
    const { data } = useSession();

    useEffect(() => {
        if (data && Object.keys(productsSlice.entities).length === 0) {
            dispatch(fetchProducts(data));
        }
    
        const interval = setInterval(() => {
            if (data && !productsSlice) {
                dispatch(fetchProducts(data));
            }
        }, 60000); // Atualiza a cada 60 segundos
    
        return () => clearInterval(interval); // Limpa o intervalo ao desmontar o componente
    }, [data, productsSlice, dispatch]);

    if (productsSlice.loading) {
        return (
            <h1>Carregando página...</h1>
        )
    }

    return (
        <>
        {productsSlice.error && <p className="mb-4 text-red-500">{productsSlice.error?.message}</p>}
            <CrudLayout title="Produtos"
                searchButtonChildren={
                    <SelectField 
                        friendlyName="Categoria" name="categoria" selectedValue={categoryID} setSelectedValue={setCategoryID} values={Object.values(categoriesSlice.entities)} />
                }
                filterButtonChildren={
                    <ButtonIconTextFloat modalName="filter-product" icon={FaFilter}><h1>Filtro</h1></ButtonIconTextFloat>
                }
                plusButtonChildren={
                    <ButtonIconTextFloat modalName="new-product" title="Novo produto" position="bottom-right">
                        <ProductForm/>
                    </ButtonIconTextFloat>
                }
                refreshButton={
                    <Refresh 
                    slice={productsSlice}
                    fetchItems={fetchProducts}
                    />
                }
                tableChildren={
                    <CrudTable 
                        columns={ProductColumns()} 
                        data={Object.values(productsSlice.entities).filter(product => !categoryID || product.category_id === categoryID).sort((a, b) => a.name.localeCompare(b.name))}>
                    </CrudTable>
                } 
                />
            </>
    )
}
export default PageProducts;