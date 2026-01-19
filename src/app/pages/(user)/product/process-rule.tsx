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
import GetCategories from "@/app/api/category/category";
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
        queryKey: ['categories'],
        queryFn: () => GetCategories(data!, 0, 1000, true),
        enabled: !!data?.user?.access_token,
    });

    const handleRefresh = async () => {
        await refetch();
        setLastUpdate(FormatRefreshTime(new Date()));
    };

    const processRules = useMemo(() => processRulesResponse?.items || [], [processRulesResponse?.items]);
    const categories = useMemo(() => categoriesResponse?.items || [], [categoriesResponse?.items]);

    const validCategories = useMemo(() =>
        categories.filter((c: any) => !c.is_additional && !c.is_complement),
        [categories]
    );

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
                            values={validCategories}
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