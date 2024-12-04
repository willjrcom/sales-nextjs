'use client';

import CategoryForm from "@/app/forms/category/form";
import CrudLayout from "@/app/components/crud/layout";
import CrudTable from "@/app/components/crud/table";
import CategoryColumns from "@/app/entities/category/table-columns";
import Refresh from "@/app/components/crud/refresh";
import { useCategories } from "@/app/context/category/context";
import { FaFilter } from "react-icons/fa";
import ButtonIconTextFloat from "@/app/components/button/button-float";
import "./style.css";

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
                    <ButtonIconTextFloat modalName="filter-category" icon={FaFilter}><h1>Filtro</h1></ButtonIconTextFloat>
                }
                plusButtonChildren={
                    <ButtonIconTextFloat title="Nova categoria" modalName="new-category" position="bottom-right">
                        <CategoryForm/>
                    </ButtonIconTextFloat>
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