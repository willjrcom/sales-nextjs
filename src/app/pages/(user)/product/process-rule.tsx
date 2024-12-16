'use client';

import ProcessRuleForm from "@/app/forms/process-rule/form";
import CrudLayout from "@/app/components/crud/layout";
import CrudTable from "@/app/components/crud/table";
import ProcessRuleColumns from "@/app/entities/process-rule/table-columns";
import Refresh from "@/app/components/crud/refresh";
import { SelectField } from "@/app/components/modal/field";
import { useEffect, useState } from "react";
import ButtonIconTextFloat from "@/app/components/button/button-float";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { useSession } from "next-auth/react";
import { fetchProcessRules } from "@/redux/slices/process-rules";

export default function PageProcessRules () {
    const [categoryID, setCategoryID] = useState("");
    const categoriesSlice = useSelector((state: RootState) => state.categories);
    const processRulesSlice = useSelector((state: RootState) => state.processRules);
    const dispatch = useDispatch<AppDispatch>();
    const { data } = useSession();

    useEffect(() => {
        if (data && Object.keys(processRulesSlice.entities).length === 0) {
            dispatch(fetchProcessRules(data));
        }
    
        const interval = setInterval(() => {
            if (data && !processRulesSlice) {
                dispatch(fetchProcessRules(data));
            }
        }, 60000); // Atualiza a cada 60 segundos
    
        return () => clearInterval(interval); // Limpa o intervalo ao desmontar o componente
    }, [data, processRulesSlice, dispatch]);

    if (processRulesSlice.loading) {
        return (
            <h1>Carregando página...</h1>
        )
    }

    return (
        <>
        {processRulesSlice.error && <p className="mb-4 text-red-500">{processRulesSlice.error?.message}</p>}
            <CrudLayout title="Processos"
                searchButtonChildren={
                    <SelectField 
                        friendlyName="Categoria" name="categoria" selectedValue={categoryID} setSelectedValue={setCategoryID} values={Object.values(categoriesSlice.entities)} />
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
                        slice={processRulesSlice}
                        fetchItems={fetchProcessRules}
                    />
                }
                tableChildren={
                    <CrudTable 
                        columns={ProcessRuleColumns()} 
                        data={Object.values(processRulesSlice).filter(item => item.category_id === categoryID).sort((a, b) => a.order - b.order)}>
                    </CrudTable>
                } 
                />
                </>
    )
}