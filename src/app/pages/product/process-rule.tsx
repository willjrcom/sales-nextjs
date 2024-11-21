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
import "./style.css";
import { useEffect } from "react";

interface PageProcessRulesProps {
    id: string
}
const PageProcessRules = ({ id }: PageProcessRulesProps) => {
    const modalHandler = ModalHandler();
    const context = useProcessRules();
    
    useEffect(() => {
        context.fetchData(id);
    }, []);

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
                    <ButtonFilter name="processos" 
                    setShowModal={modalHandler.setShowModal} 
                    showModal={modalHandler.showModal}/>
                }
                plusButtonChildren={
                    <ButtonPlus name="processos"
                        setModal={modalHandler.setShowModal}
                        showModal={modalHandler.showModal}>
                        <ProcessRuleForm 
                            onSubmit={NewProcessRule}
                            handleCloseModal={() => modalHandler.setShowModal(false)}
                            context={context}/>
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
                        data={context.items}>
                    </CrudTable>
                } 
                />
            </>
    )
}
export default PageProcessRules;