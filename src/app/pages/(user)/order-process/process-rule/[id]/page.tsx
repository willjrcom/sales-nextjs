"use client";
import RequestError from "@/app/api/error";
import GetProcessesByProcessRuleID from "@/app/api/order-process/by-process-rule/route";
import { OrderProcess } from "@/app/entities/order-process/order-process";
import ProcessRule from "@/app/entities/process-rule/process-rule";
import { RootState } from "@/redux/store";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import CardOrderProcess from "../card";
import { CurrentProcessRuleProvider, useCurrentProcessRule } from "@/app/context/current-process-rule/context";

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
    const categoriesSlice = useSelector((state: RootState) => state.categories);
    const [processRule, setProcessRule] = useState<ProcessRule | null>(null);
    const [orderProcesses, setOrderProcesses] = useState<OrderProcess[]>([]);
    const contextCurrentProcessRule = useCurrentProcessRule();

    useEffect(() => {
        contextCurrentProcessRule.fetchData(id as string)
    
        const interval = setInterval(() => {
            contextCurrentProcessRule.fetchData(id as string)
        }, 30000); // Atualiza a cada 60 segundos
    
        return () => clearInterval(interval); // Limpa o intervalo ao desmontar o componente
    }, [data?.user.idToken]);

    useEffect(() => {
        console.log(contextCurrentProcessRule.orderProcesses)
        if (!contextCurrentProcessRule.orderProcesses) {
            setOrderProcesses([]);
            return
        };

        setOrderProcesses(contextCurrentProcessRule.orderProcesses);
    }, [data?.user.idToken, contextCurrentProcessRule.orderProcesses]);

    useEffect(() => {
        if (Object.keys(categoriesSlice.entities).length === 0) return;
        const category = Object.values(categoriesSlice.entities).find((category) => category.process_rules.some((processRule) => processRule.id === id));
        if (!category) return;

        const processRule = category?.process_rules.find((processRule) => processRule.id === id);
        if (!processRule) return;

        setProcessRule(processRule);
    }, [categoriesSlice.entities, id]);

    if (!processRule) return null;

    return (
        <div className='max-w-[85vw] flex-auto h-full'>
            <h1 className="text-2xl font-bold mb-4">{processRule?.name}</h1>
            {contextCurrentProcessRule.getError() && <p className="mb-4 text-red-500">{contextCurrentProcessRule.getError()?.message}</p>}
            {orderProcesses?.sort((a, b) => a.status === "Started" ? -1 : 1).map((process) => <CardOrderProcess key={process.id} orderProcess={process} />)}
        </div>
    );
}

export default PageProcessRule