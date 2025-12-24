'use client';

import ProcessRuleForm from "@/app/forms/process-rule/form";
import CrudLayout from "@/app/components/crud/crud-layout";
import PageTitle from '@/app/components/PageTitle';
import CrudTable from "@/app/components/crud/table";
import ProcessRuleColumns from "@/app/entities/process-rule/table-columns";
import { SelectField } from "@/app/components/modal/field";
import { useMemo, useState } from "react";
import ButtonIconTextFloat from "@/app/components/button/button-float";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import GetCategories from "@/app/api/category/category";
import Refresh, { FormatRefreshTime } from "@/app/components/crud/refresh";

export default function PageProcessRules() {
    const [categoryID, setCategoryID] = useState("");
    const [lastUpdate, setLastUpdate] = useState<string>(FormatRefreshTime(new Date()));
    const { data } = useSession();

    const { data: categoriesResponse, refetch, isPending } = useQuery({
        queryKey: ['categories'],
        queryFn: () => GetCategories(data!),
        enabled: !!data?.user?.access_token,
    });

    const handleRefresh = async () => {
        await refetch();
        setLastUpdate(new Date().toLocaleTimeString());
    };

    const categories = useMemo(() => categoriesResponse?.items || [], [categoriesResponse?.items]);

    const processRules = useMemo(() => {
        return categories.map((category) => category.process_rules || []).flat();
    }, [categories]);

    const validCategories = useMemo(() => 
        categories.filter(c => !c.is_additional && !c.is_complement), 
        [categories]
    );

    const validProcessRules = useMemo(() => 
        processRules.filter(processRule => !categoryID || processRule.category_id === categoryID).sort((a, b) => a.order - b.order),
        [processRules, categoryID]
    );

    return (
        <>
            <ButtonIconTextFloat modalName="new-process-rule" title="Novo processo" position="bottom-right">
                <ProcessRuleForm />
            </ButtonIconTextFloat>

            <CrudLayout title={<PageTitle title="Processos" tooltip="Defina as etapas de processamento para produtos, com ordem e tempo ideal." />}
                searchButtonChildren={
                        <SelectField
                            friendlyName="Categoria" name="categoria" selectedValue={categoryID} setSelectedValue={setCategoryID} values={validCategories} optional />
                }

                refreshButton={
                    <Refresh onRefresh={handleRefresh} isPending={isPending} lastUpdate={lastUpdate} />
                }

                tableChildren={
                    <CrudTable columns={ProcessRuleColumns()} data={validProcessRules} />
                }
            />
        </>
    )
}