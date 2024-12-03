'use client';

import CategoryForm from "@/app/forms/category/form";
import CrudLayout from "@/app/components/crud/layout";
import ButtonIconText from "@/app/components/button/button-icon-text";
import CrudTable from "@/app/components/crud/table";
import CategoryColumns from "@/app/entities/category/table-columns";
import Refresh from "@/app/components/crud/refresh";
import { useCategories } from "@/app/context/category/context";
import "./style.css";
import { FaFilter } from "react-icons/fa";

const PageCategories = () => {
    const context = useCategories();

    if (context.getLoading()) {
        return (
            <h1>Carregando página...</h1>
        )
    }

    return (
        <>
        {context.getError() && <p className="mb-4 text-red-500">{context.getError()?.message}</p>}
            <CrudLayout title="Categorias"
                filterButtonChildren={
                    <ButtonIconText modalName="filter-category" icon={FaFilter}><h1>Filtro</h1></ButtonIconText>
                }
                plusButtonChildren={
                    <ButtonIconText title="Nova categoria" modalName="new-category">
                        <CategoryForm/>
                    </ButtonIconText>
                }
                refreshButton={
                    <Refresh 
                        context={context}
                    />
                }
                tableChildren={
                    <CrudTable 
                        columns={CategoryColumns()} 
                        data={context.items}>
                    </CrudTable>
                } 
                />
            </>
    )
}
export default PageCategories;