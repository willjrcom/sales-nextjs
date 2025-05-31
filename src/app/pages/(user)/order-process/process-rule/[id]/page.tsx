"use client";

import OrderProcess from "@/app/entities/order-process/order-process";
import ProcessRule from "@/app/entities/process-rule/process-rule";
import { AppDispatch, RootState } from "@/redux/store";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CurrentProcessRuleProvider } from "@/app/context/current-process-rule/context";
import { fetchOrderProcesses } from "@/redux/slices/order-processes";
import CrudLayout from "@/app/components/crud/layout";
import PageTitle from '@/app/components/PageTitle';
import Refresh from "@/app/components/crud/refresh";
import { SelectField } from "@/app/components/modal/field";
import OrderProcessCard from "./order-process";

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
    const router = useRouter();

    const updateParam = (newId: string) => {
        router.replace(`/pages/order-process/process-rule/${newId}`);
    };

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

        const processRule = processRules.find((p) => p.id === currentProcessRuleID)
        if (processRule) {
            setProcessRule(processRule)
            updateParam(processRule.id)
        }

        return () => clearInterval(interval); // Limpa o intervalo ao desmontar o componente
    }, [data?.user.access_token, dispatch, currentProcessRuleID]);

    useEffect(() => {
        const entities = Object.values(orderProcessesSlice.entities);
        if (entities.length === 0) {
            setOrderProcesses([]);
            return;
        }
    
        setOrderProcesses([...entities]); 
    }, [data?.user.access_token, orderProcessesSlice.entities]);
    

    useEffect(() => {
        if (Object.keys(categoriesSlice.entities).length === 0) return;

        const category = Object.values(categoriesSlice.entities).find((category) =>
            category.process_rules?.some((processRule) => processRule.id === id)
        );
        if (!category) return;

        const processRules = category.process_rules ? [...category.process_rules] : []; // Cria uma cópia
        setProcessRules(processRules.sort((a, b) => a.order - b.order)); // Ordena a cópia

        const processRule = processRules.find((processRule) => processRule.id === id);
        if (!processRule) return;

        setProcessRule({ ...processRule }); // Cria uma cópia para evitar referência direta
    }, [categoriesSlice.entities, id]);


    if (!processRule) return null;

    const body = (
        <>
            <p>Tempo ideal de produção: {processRule.ideal_time}</p>
            {
                orderProcesses?.sort((a, b) => a.status === "Started" ? -1 : 1)
                    .map((process) => <OrderProcessCard key={process.id} orderProcess={process} />)
            }
        </>
    )

    return (
        <>
            <CrudLayout title={
                processRule.name ?
                    <PageTitle title={processRule.name} tooltip="Exibe e gerencia os pedidos em execução nesta etapa do processo." /> :
                    "Carregando..."
            }
                searchButtonChildren={
                    <SelectField friendlyName="Processos" name="process" disabled={false} values={processRules} selectedValue={currentProcessRuleID} setSelectedValue={setCurrentProcessRuleID} optional />
                }
                refreshButton={
                    <Refresh
                        slice={orderProcessesSlice}
                        fetchItemsByID={fetchOrderProcesses}
                        id={currentProcessRuleID}
                    />
                }
                tableChildren={body}
            />
        </>
    );
}

export default PageProcessRule