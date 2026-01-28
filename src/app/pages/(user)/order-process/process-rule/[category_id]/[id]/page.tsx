"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import CrudLayout from "@/app/components/crud/crud-layout";
import PageTitle from '@/app/components/ui/page-title';
import { SelectField } from "@/app/components/modal/field";
import OrderProcessCard from "./order-process";
import { useQuery } from '@tanstack/react-query';
import GetProcessesByProcessRuleID from '@/app/api/order-process/by-process-rule/order-process';
import Refresh, { FormatRefreshTime } from "@/app/components/crud/refresh";
import Loading from "@/app/pages/loading";
import { GetProcessRulesByCategoryID } from "@/app/api/process-rule/process-rule";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

const PageProcessRule = () => {
    const { category_id, id } = useParams();
    const { data } = useSession();
    const [currentProcessRuleID, setCurrentProcessRuleID] = useState<string>(id as string);
    const [lastUpdate, setLastUpdate] = useState<string>(FormatRefreshTime(new Date()));
    const router = useRouter();

    const { data: processRulesResponse } = useQuery({
        queryKey: ['process-rules', category_id],
        queryFn: () => GetProcessRulesByCategoryID(data!, category_id as string),
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
        setLastUpdate(FormatRefreshTime(new Date()));
    };

    const orderProcesses = useMemo(() => orderProcessesResponse?.items || [], [orderProcessesResponse?.items]);

    const processRules = useMemo(() => processRulesResponse || [], [processRulesResponse]);
    const processRule = useMemo(() => processRules.find((pr) => pr.id === currentProcessRuleID), [processRules, currentProcessRuleID]);

    useEffect(() => router.replace(`/pages/order-process/process-rule/${category_id}/${currentProcessRuleID}`), [category_id, currentProcessRuleID]);
    useEffect(() => {
        setCurrentProcessRuleID(id as string);
    }, [id]);

    if (isPending || !processRule) {
        return <>
            <Loading />
        </>
    };

    const body = (
        <>
            <div className="flex justify-between">
                <p>Tempo ideal de produção: {processRule.ideal_time}</p>
                <p>Total de processos: {orderProcesses.length}</p>
            </div>

            {(!orderProcesses || orderProcesses.length === 0) ? (
                <p className="text-gray-500 mt-4">Nenhum processo na fila</p>
            ) : (
                orderProcesses
                    .sort((a, b) => a.status === "Started" ? -1 : 1)
                    .sort((a, b) => a.created_at.localeCompare(b.created_at))
                    .map((process) => <OrderProcessCard key={process.id} orderProcess={process} />)
            )}
        </>
    )

    return (
        <>
            <div className="mb-4">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link href="/pages/order-process">Processos</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>{processRule?.name || "Detalhes"}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>
            <CrudLayout title={
                processRule.name ?
                    <PageTitle title={processRule.name} tooltip="Exibe e gerencia os pedidos em execução nesta etapa do processo." /> :
                    "Carregando..."
            }
                searchButtonChildren={
                    <SelectField friendlyName="Processo Atual" name="process" disabled={false} values={processRules} selectedValue={currentProcessRuleID} setSelectedValue={setCurrentProcessRuleID} optional removeDefaultOption />
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