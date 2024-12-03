import ProductForm from "@/app/forms/product/form";
import CrudLayout from "@/app/components/crud/layout";
import ButtonIconText from "@/app/components/button/button-icon-text";
import CrudTable from "@/app/components/crud/table";
import ProductColumns from "@/app/entities/product/table-columns";
import Refresh from "@/app/components/crud/refresh";
import { useProducts } from "@/app/context/product/context";
import "./style.css";
import { FaFilter } from "react-icons/fa";

const PageProducts = () => {
    const context = useProducts();

    if (context.getLoading()) {
        return (
            <h1>Carregando página...</h1>
        )
    }

    return (
        <>
        {context.getError() && <p className="mb-4 text-red-500">{context.getError()?.message}</p>}
            <CrudLayout title="Produtos"
                filterButtonChildren={
                    <ButtonIconText modalName="filter-product" icon={FaFilter}><h1>Filtro</h1></ButtonIconText>
                }
                plusButtonChildren={
                    <ButtonIconText modalName="new-product" title="Novo produto">
                        <ProductForm/>
                    </ButtonIconText>
                }
                refreshButton={
                    <Refresh 
                        context={context}
                    />
                }
                tableChildren={
                    <CrudTable 
                        columns={ProductColumns()} 
                        data={context.items}>
                    </CrudTable>
                } 
                />
            </>
    )
}
export default PageProducts;