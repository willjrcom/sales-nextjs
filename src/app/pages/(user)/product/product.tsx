import ProductForm from "@/app/forms/product/form";
import CrudLayout from "@/app/components/crud/layout";
import CrudTable from "@/app/components/crud/table";
import ProductColumns from "@/app/entities/product/table-columns";
import Refresh from "@/app/components/crud/refresh";
import { useProducts } from "@/app/context/product/context";
import "./style.css";
import { FaFilter } from "react-icons/fa";
import ButtonIconTextFloat from "@/app/components/button/button-float";

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
                    <ButtonIconTextFloat modalName="filter-product" icon={FaFilter}><h1>Filtro</h1></ButtonIconTextFloat>
                }
                plusButtonChildren={
                    <ButtonIconTextFloat modalName="new-product" title="Novo produto" position="bottom-right">
                        <ProductForm/>
                    </ButtonIconTextFloat>
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