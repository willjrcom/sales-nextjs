'use client';

import ProcessRuleForm from "@/app/forms/process-rule/form";
import CrudLayout from "@/app/components/crud/crud-layout";
import PageTitle from '@/app/components/PageTitle';
import CrudTable from "@/app/components/crud/table";
import ProcessRuleColumns from "@/app/entities/process-rule/table-columns";
import { CheckboxField, SelectField } from "@/app/components/modal/field";
import { useMemo, useState } from "react";
import ButtonIconTextFloat from "@/app/components/button/button-float";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import GetProcessRules from "@/app/api/process-rule/process-rule";
import { GetCategoriesMap } from "@/app/api/category/category";
import Refresh, { FormatRefreshTime } from "@/app/components/crud/refresh";

export default function PageProcessRules() {
    const [categoryID, setCategoryID] = useState("");
    const [showInactive, setShowInactive] = useState(false);
    const [lastUpdate, setLastUpdate] = useState<string>(FormatRefreshTime(new Date()));
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
    const { data } = useSession();

    const { data: processRulesResponse, refetch, isPending } = useQuery({
        queryKey: ['process-rules', pagination.pageIndex, pagination.pageSize, !showInactive],
        queryFn: () => GetProcessRules(data!, !showInactive),
        enabled: !!data?.user?.access_token,
    });

    const { data: categoriesResponse } = useQuery({
        queryKey: ['categories', 'map', 'process-rule'],
        queryFn: () => GetCategoriesMap(data!, true, false, false),
        enabled: !!data?.user?.access_token,
        refetchInterval: 60000,
    });

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

    return (
        <>
            <ButtonIconTextFloat modalName="new-process-rule" title="Novo processo" position="bottom-right">
                <ProcessRuleForm />
            </ButtonIconTextFloat>

            <CrudLayout
                title={<PageTitle title="Processos" tooltip="Defina as etapas de processamento para produtos, com ordem e tempo ideal." />}
                searchButtonChildren={
                    <div className="flex gap-4 items-center">
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
                        totalCount={processRules.length}
                        onPageChange={(pageIndex, pageSize) => {
                            setPagination({ pageIndex, pageSize });
                        }}
                    />
                }
            />
        </>
    )
}