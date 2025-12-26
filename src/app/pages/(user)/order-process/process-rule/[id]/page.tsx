"use client";

import OrderProcess from "@/app/entities/order-process/order-process";
import ProcessRule from "@/app/entities/process-rule/process-rule";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { CurrentProcessRuleProvider } from "@/app/context/current-process-rule/context";
import CrudLayout from "@/app/components/crud/crud-layout";
import PageTitle from '@/app/components/PageTitle';
import { SelectField } from "@/app/components/modal/field";
import OrderProcessCard from "./order-process";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import GetCategories from '@/app/api/category/category';
import GetProcessesByProcessRuleID from '@/app/api/order-process/by-process-rule/order-process';
import Refresh, { FormatRefreshTime } from "@/app/components/crud/refresh";

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
    const [processRule, setProcessRule] = useState<ProcessRule | null>(null);
    const [processRules, setProcessRules] = useState<ProcessRule[]>([]);
    const [lastUpdate, setLastUpdate] = useState<string>(FormatRefreshTime(new Date()));
    const router = useRouter();

    const { data: categoriesResponse } = useQuery({
        queryKey: ['categories'],
        queryFn: () => GetCategories(data!),
        enabled: !!data?.user?.access_token,
    });

    const { data: orderProcessesResponse, refetch, isPending } = useQuery({
        queryKey: ['orderProcesses', currentProcessRuleID],
        queryFn: () => GetProcessesByProcessRuleID(currentProcessRuleID, data!),
        enabled: !!data?.user?.access_token && !!currentProcessRuleID,
        refetchInterval: 5000,
    });

    const handleRefresh = async () => {
        await refetch();
        setLastUpdate(new Date().toLocaleTimeString());
    };

    const categories = useMemo(() => categoriesResponse?.items || [], [categoriesResponse]);
    const orderProcesses = useMemo(() => orderProcessesResponse?.items || [], [orderProcessesResponse]);

    const updateParam = (newId: string) => {
        router.replace(`/pages/order-process/process-rule/${newId}`);
    };

    useEffect(() => {
        setCurrentProcessRuleID(id as string);
    }, [id]);

    useEffect(() => {
        if (!currentProcessRuleID) return;

        const processRule = processRules.find((p) => p.id === currentProcessRuleID);
        if (processRule) {
            setProcessRule(processRule);
            updateParam(processRule.id);
        }
    }, [currentProcessRuleID, processRules]);

    useEffect(() => {
        if (categories.length === 0) return;

        const category = categories.find((cat) =>
            cat.process_rules?.some((pr) => pr.id === id)
        );
        if (!category) return;

        const rules = category.process_rules ? [...category.process_rules] : [];
        setProcessRules(rules.sort((a, b) => a.order - b.order));

        const rule = rules.find((pr) => pr.id === id);
        if (!rule) return;

        setProcessRule({ ...rule });
    }, [categories, id]);


    if (!processRule) return null;

    const body = (
        <>
            <p>Tempo ideal de produção: {processRule.ideal_time}</p>
            {(!orderProcesses || orderProcesses.length === 0) ? (
                <p className="text-gray-500 mt-4">Nenhum processo na fila</p>
            ) : (
                orderProcesses
                    .sort((a, b) => a.status === "Started" ? -1 : 1)
                    .map((process) => <OrderProcessCard key={process.id} orderProcess={process} />)
            )}
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
                    <Refresh onRefresh={handleRefresh} isPending={isPending} lastUpdate={lastUpdate} />
                }
                tableChildren={body}
            />
        </>
    );
}

export default PageProcessRule