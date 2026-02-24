'use client';

import ProcessRuleForm from "@/app/forms/process-rule/form";
import CrudLayout from "@/app/components/crud/crud-layout";
import PageTitle from '@/app/components/ui/page-title';
import CrudTable from "@/app/components/crud/table";
import ProcessRuleColumns from "@/app/entities/process-rule/table-columns";
import { CheckboxField, SelectField } from "@/app/components/modal/field";
import { useMemo, useState } from "react";
import ButtonIconTextFloat from "@/app/components/button/button-float";
import { useSession } from "next-auth/react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { GetProcessRulesByCategoryID } from "@/app/api/process-rule/process-rule";
import Refresh, { FormatRefreshTime } from "@/app/components/crud/refresh";
import { useUser } from "@/app/context/user-context";
import AccessDenied from "@/app/components/access-denied";
import Category from "@/app/entities/category/category";

interface ListProcessRuleProps {
    category: Category;
}

export default function ListProcessRule({ category }: ListProcessRuleProps) {
    const [showInactive, setShowInactive] = useState(false);
    const [lastUpdate, setLastUpdate] = useState<string>(FormatRefreshTime(new Date()));
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
    const { data } = useSession();
    const { hasPermission, user } = useUser();

    const { data: processRulesResponse, refetch, isPending } = useQuery({
        queryKey: ['process-rules', 'by-category', category.id],
        queryFn: () => GetProcessRulesByCategoryID(data!, category.id),
        enabled: !!data?.user?.access_token && !!category.id,
        placeholderData: keepPreviousData,
    });

    if (!user) {
        return <AccessDenied message="Usuário não encontrado ou sessão expirada." />;
    }

    if (!hasPermission('process-rule')) {
        return <AccessDenied />
    }

    const handleRefresh = async () => {
        await refetch();
        setLastUpdate(FormatRefreshTime(new Date()));
    };

    const processRules = useMemo(() => processRulesResponse || [], [processRulesResponse]);

    return (
        <>
            <ButtonIconTextFloat modalName="new-process-rule" title="Novo processo" position="bottom-right">
                <ProcessRuleForm category={category} />
            </ButtonIconTextFloat>

            <CrudLayout
                title={<PageTitle title="Regras de Processo" tooltip="Defina as etapas de processamento para produtos, com ordem e tempo ideal." />}
                searchButtonChildren={
                    <div className="flex gap-2">
                        <CheckboxField friendlyName="Mostrar inativos" name="show_inactive" value={showInactive} setValue={setShowInactive} />
                    </div>
                }

                refreshButton={
                    <Refresh onRefresh={handleRefresh} isPending={isPending} lastUpdate={lastUpdate} />
                }

                tableChildren={
                    <CrudTable
                        columns={ProcessRuleColumns(category)}
                        data={processRules}
                        totalCount={0}
                        onPageChange={(pageIndex, pageSize) => {
                            setPagination({ pageIndex, pageSize });
                        }}
                    />
                }
            />
        </>
    )
}