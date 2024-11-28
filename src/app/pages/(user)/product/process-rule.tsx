'use client';

import ProcessRuleForm from "@/app/forms/process-rule/form";
import CrudLayout from "@/app/components/crud/layout";
import ButtonPlus from "@/app/components/crud/button-plus";
import CrudTable from "@/app/components/crud/table";
import ProcessRuleColumns from "@/app/entities/process-rule/table-columns";
import Refresh from "@/app/components/crud/refresh";
import { useProcessRules } from "@/app/context/process-rule/context";
import { SelectField } from "@/app/components/modal/field";
import { useCategories } from "@/app/context/category/context";
import { useState } from "react";

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
        {context.getError() && <p className="mb-4 text-red-500">{context.getError()}</p>}
            <CrudLayout title="Processos"
                filterButtonChildren={
                    <SelectField 
                        friendlyName="Categoria" name="categoria" selectedValue={categoryID} setSelectedValue={setCategoryID} values={contextCategory.items} />
                }
                plusButtonChildren={
                    <ButtonPlus modalName="new-process-rule" name="processos">
                        <ProcessRuleForm/>
                    </ButtonPlus>
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