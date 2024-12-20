"use client";

import { OrderProcess } from "@/app/entities/order-process/order-process";
import ProcessRule from "@/app/entities/process-rule/process-rule";
import { AppDispatch, RootState } from "@/redux/store";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import CardOrderProcess from "./card";
import { CurrentProcessRuleProvider } from "@/app/context/current-process-rule/context";
import { fetchOrderProcesses } from "@/redux/slices/order-processes";
import CrudLayout from "@/app/components/crud/layout";
import Refresh from "@/app/components/crud/refresh";
import { SelectField } from "@/app/components/modal/field";

const PageProcessRule = () => {
    return (
        <CurrentProcessRuleProvider>
            <Component />
        </CurrentProcessRuleProvider>
    )
}

const Component = () => {
    const { id } = useParams();
    const { data } = useSession();
    const [currentProcessRuleID, setCurrentProcessRuleID] = useState<string>("");
    const categoriesSlice = useSelector((state: RootState) => state.categories);
    const orderProcessesSlice = useSelector((state: RootState) => state.orderProcesses);
    const [processRule, setProcessRule] = useState<ProcessRule | null>(null);
    const [processRules, setProcessRules] = useState<ProcessRule[]>([]);
    const [orderProcesses, setOrderProcesses] = useState<OrderProcess[]>([]);
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        setCurrentProcessRuleID(id as string);
    }, [id]);

    useEffect(() => {
        if (!data) return;
        dispatch(fetchOrderProcesses({ id: currentProcessRuleID, session: data }));

        const interval = setInterval(() => {
            if (data) {
                dispatch(fetchOrderProcesses({ id: currentProcessRuleID, session: data }));
            }
        }, 10000); // Atualiza a cada 60 segundos

        return () => clearInterval(interval); // Limpa o intervalo ao desmontar o componente
    }, [data?.user.idToken, dispatch, currentProcessRuleID]);

    useEffect(() => {
        if (!data) return;
        dispatch(fetchOrderProcesses({ id: currentProcessRuleID, session: data }));

        const processRule = processRules.find((p) => p.id === currentProcessRuleID)
        if (!processRule) return
        setProcessRule(processRule)
    }, [currentProcessRuleID]
)
    useEffect(() => {
        if (!Object.values(orderProcessesSlice.entities)) {
            setOrderProcesses([]);
            return
        };

        setOrderProcesses(Object.values(orderProcessesSlice.entities));
    }, [data?.user.idToken, orderProcessesSlice.entities]);

    useEffect(() => {
        if (Object.keys(categoriesSlice.entities).length === 0) return;
        const category = Object.values(categoriesSlice.entities).find((category) => category.process_rules.some((processRule) => processRule.id === id));
        if (!category) return;

        setProcessRules(category.process_rules || []);

        const processRule = category?.process_rules.find((processRule) => processRule.id === id);
        if (!processRule) return;

        setProcessRule(processRule);
    }, [categoriesSlice.entities, id]);

    if (!processRule) return null;

    return (
        <>
            {orderProcessesSlice.error && <p className="mb-4 text-red-500">{orderProcessesSlice.error?.message}</p>}
            <CrudLayout title={processRule.name || "Carregando..."}
            searchButtonChildren={
                <SelectField friendlyName="Processos" name="process" disabled={false} values={processRules} selectedValue={currentProcessRuleID} setSelectedValue={setCurrentProcessRuleID} />
            }
                refreshButton={
                    <Refresh
                        slice={orderProcessesSlice}
                        fetchItemsByID={fetchOrderProcesses}
                        id={currentProcessRuleID}
                    />
                }
                tableChildren=
                {orderProcesses?.sort((a, b) => a.status === "Started" ? -1 : 1).map((process) => <CardOrderProcess key={process.id} orderProcess={process} />)}
            />
        </>
    );
}

export default PageProcessRule