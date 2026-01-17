"use client";

import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import CrudLayout from "@/app/components/crud/crud-layout";
import PageTitle from '@/app/components/PageTitle';
import { SelectField } from "@/app/components/modal/field";
import OrderProcessCard from "./order-process";
import { useQuery } from '@tanstack/react-query';
import GetCategories from '@/app/api/category/category';
import GetProcessesByProcessRuleID from '@/app/api/order-process/by-process-rule/order-process';
import Refresh, { FormatRefreshTime } from "@/app/components/crud/refresh";
import Loading from "@/app/pages/loading";

const PageProcessRule = () => {
    const { id } = useParams();
    const { data } = useSession();
    const [currentProcessRuleID, setCurrentProcessRuleID] = useState<string>("");
    const [lastUpdate, setLastUpdate] = useState<string>(FormatRefreshTime(new Date()));
    const router = useRouter();

    const { data: categoriesResponse } = useQuery({
        queryKey: ['categories'],
        queryFn: () => GetCategories(data!),
        enabled: !!data?.user?.access_token,
    });

    const { data: orderProcessesResponse, refetch, isPending } = useQuery({
        queryKey: ['order-processes', currentProcessRuleID],
        queryFn: () => GetProcessesByProcessRuleID(currentProcessRuleID, data!),
        enabled: !!data?.user?.access_token && !!currentProcessRuleID,
        refetchInterval: 5000,
    });

    const handleRefresh = async () => {
        await refetch();
        setLastUpdate(new Date().toLocaleTimeString());
    };

    const categories = useMemo(() => categoriesResponse?.items || [], [categoriesResponse?.items]);
    const orderProcesses = useMemo(() => orderProcessesResponse?.items || [], [orderProcessesResponse?.items]);
    const category = useMemo(() => categories.find((cat) => cat.process_rules?.some((pr) => pr.id === id)), [categories, id]);
    const processRules = useMemo(() => category?.process_rules.sort((a, b) => a.order - b.order) || [], [category]);
    const processRule = useMemo(() => processRules.find((pr) => pr.id === id), [processRules, id]);

    useEffect(() => router.replace(`/pages/order-process/process-rule/${id}`), [id]);

    if (isPending || !processRule) {
        return <>
            <Loading />
        </>
    };

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