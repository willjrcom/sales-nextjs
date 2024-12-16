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
import { fetchCategories } from "@/redux/slices/categories";
import ProcessRule from "@/app/entities/process-rule/process-rule";

export default function PageProcessRules() {
    const [categoryID, setCategoryID] = useState("");
    const categoriesSlice = useSelector((state: RootState) => state.categories);
    const [processRules, setProcessRules] = useState<ProcessRule[]>([]);
    const dispatch = useDispatch<AppDispatch>();
    const { data } = useSession();

    useEffect(() => {
        if (data && Object.keys(categoriesSlice.entities).length === 0) {
            dispatch(fetchCategories(data));
        }

        const interval = setInterval(() => {
            if (data && !categoriesSlice) {
                dispatch(fetchCategories(data));
            }
        }, 60000); // Atualiza a cada 60 segundos

        return () => clearInterval(interval); // Limpa o intervalo ao desmontar o componente
    }, [data, categoriesSlice, dispatch]);

    useEffect(() => {
        if (Object.keys(categoriesSlice.entities).length === 0) return;
        const processRulesByCategories = Object.values(categoriesSlice.entities).map((category) => category.process_rules || []).flat();
        setProcessRules(processRulesByCategories)
        setCategoryID(Object.values(categoriesSlice.entities)[0].id)
    }, [categoriesSlice.entities]);

    if (categoriesSlice.loading) {
        return (
            <h1>Carregando página...</h1>
        )
    }

    return (
        <>
            {categoriesSlice.error && <p className="mb-4 text-red-500">{categoriesSlice.error?.message}</p>}
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
                        <ProcessRuleForm />
                    </ButtonIconTextFloat>
                }
                refreshButton={
                    <Refresh
                        slice={categoriesSlice}
                        fetchItems={fetchCategories}
                    />
                }
                tableChildren={
                    <CrudTable
                        columns={ProcessRuleColumns()}
                        data={processRules.filter(processRule => !categoryID || processRule.category_id === categoryID).sort((a, b) => a.name.localeCompare(b.name))}>
                    </CrudTable>
                }
            />
        </>
    )
}