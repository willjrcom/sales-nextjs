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
import GetProcessRules from "@/app/api/process-rule/process-rule";
import { GetCategoriesMap } from "@/app/api/category/category";
import Refresh, { FormatRefreshTime } from "@/app/components/crud/refresh";
import { useUser } from "@/app/context/user-context";
import AccessDenied from "@/app/components/access-denied";

export default function PageProcessRules() {
    const [categoryID, setCategoryID] = useState("");
    const [showInactive, setShowInactive] = useState(false);
    const [lastUpdate, setLastUpdate] = useState<string>(FormatRefreshTime(new Date()));
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
    const { data } = useSession();
    const { hasPermission, user } = useUser();

    const { data: processRulesResponse, refetch, isPending } = useQuery({
        queryKey: ['process-rules', pagination.pageIndex, pagination.pageSize, !showInactive],
        queryFn: () => GetProcessRules(data!, !showInactive),
        enabled: !!data?.user?.access_token,
        placeholderData: keepPreviousData,
    });

    const { data: categoriesResponse } = useQuery({
        queryKey: ['categories', 'map', 'process-rule'],
        queryFn: () => GetCategoriesMap(data!, true, false, false),
        enabled: !!data?.user?.access_token,
        refetchInterval: 60000,
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

    const processRules = useMemo(() => processRulesResponse?.items || [], [processRulesResponse?.items]);
    const categories = useMemo(() => categoriesResponse || [], [categoriesResponse]);

    const validProcessRules = useMemo(() =>
        processRules
            .filter((pr: any) => !categoryID || pr.category_id === categoryID)
            .sort((a: any, b: any) => a.order - b.order),
        [processRules, categoryID]
    );
    const totalCount = useMemo(() => parseInt(processRulesResponse?.headers.get('X-Total-Count') || '0'), [processRulesResponse?.items]);

    return (
        <>
            <ButtonIconTextFloat modalName="new-process-rule" title="Novo processo" position="bottom-right">
                <ProcessRuleForm />
            </ButtonIconTextFloat>

            <CrudLayout
                title={<PageTitle title="Regras de Processo" tooltip="Defina as etapas de processamento para produtos, com ordem e tempo ideal." />}
                searchButtonChildren={
                    <div className="flex gap-2">
                        <SelectField
                            friendlyName="Categoria"
                            name="categoria"
                            selectedValue={categoryID}
                            setSelectedValue={setCategoryID}
                            values={categories}
                            optional
                        />
                        <CheckboxField friendlyName="Mostrar inativos" name="show_inactive" value={showInactive} setValue={setShowInactive} />
                    </div>
                }

                refreshButton={
                    <Refresh onRefresh={handleRefresh} isPending={isPending} lastUpdate={lastUpdate} />
                }

                tableChildren={
                    <CrudTable
                        columns={ProcessRuleColumns()}
                        data={validProcessRules}
                        totalCount={totalCount}
                        onPageChange={(pageIndex, pageSize) => {
                            setPagination({ pageIndex, pageSize });
                        }}
                    />
                }
            />
        </>
    )
}