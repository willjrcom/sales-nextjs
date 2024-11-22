'use client';

import ProcessRuleForm from "@/app/forms/process-rule/form";
import CrudLayout from "@/app/components/crud/layout";
import ButtonFilter from "@/app/components/crud/button-filter";
import ButtonPlus from "@/app/components/crud/button-plus";
import CrudTable from "@/app/components/crud/table";
import ProcessRuleColumns from "@/app/entities/process-rule/table-columns";
import Refresh from "@/app/components/crud/refresh";
import ModalHandler from "@/app/components/modal/modal";
import NewProcessRule from "@/app/api/process-rule/new/route";
import { useProcessRules } from "@/app/context/process-rule/context";
import { SelectField } from "@/app/forms/field";
import { useCategories } from "@/app/context/category/context";
import { useState } from "react";

export default function PageProcessRules () {
    const [categoryID, setCategoryID] = useState("");
    const modalHandler = ModalHandler();
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
                    <ButtonPlus name="processos"
                        setModal={modalHandler.setShowModal}
                        showModal={modalHandler.showModal}>
                        <ProcessRuleForm 
                            onSubmit={NewProcessRule}/>
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
                        data={context.filterItems!('category_id', categoryID)}>
                    </CrudTable>
                } 
                />
                </>
    )
}