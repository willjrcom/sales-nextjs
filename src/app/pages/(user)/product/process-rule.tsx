'use client';

import ProcessRuleForm from "@/app/forms/process-rule/form";
import CrudLayout from "@/app/components/crud/layout";
import ButtonIconText from "@/app/components/button/button-icon-text";
import CrudTable from "@/app/components/crud/table";
import ProcessRuleColumns from "@/app/entities/process-rule/table-columns";
import Refresh from "@/app/components/crud/refresh";
import { useProcessRules } from "@/app/context/process-rule/context";
import { SelectField } from "@/app/components/modal/field";
import { useCategories } from "@/app/context/category/context";
import { useState } from "react";
import ButtonIconTextFloat from "@/app/components/button/button-float";

export default function PageProcessRules () {
    const [categoryID, setCategoryID] = useState("");
    const context = useProcessRules();
    const contextCategory = useCategories();

    if (context.getLoading()) {
        return (
            <h1>Carregando página...</h1>
        )
    }

    return (
        <>
        {context.getError() && <p className="mb-4 text-red-500">{context.getError()?.message}</p>}
            <CrudLayout title="Processos"
                searchButtonChildren={
                    <SelectField 
                        friendlyName="Categoria" name="categoria" selectedValue={categoryID} setSelectedValue={setCategoryID} values={contextCategory.items} />
                }
                filterButtonChildren={
                    <h1>Filtro</h1>
                }
                plusButtonChildren={
                    <ButtonIconTextFloat modalName="new-process-rule" title="Novo processo" position="bottom-right">
                        <ProcessRuleForm/>
                    </ButtonIconTextFloat>
                }
                refreshButton={
                    <Refresh 
                        context={context}
                    />
                }
                tableChildren={
                    <CrudTable 
                        columns={ProcessRuleColumns()} 
                        data={context.filterItems('category_id', categoryID)}>
                    </CrudTable>
                } 
                />
                </>
    )
}