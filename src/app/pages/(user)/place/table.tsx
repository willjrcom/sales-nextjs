'use client';

import CrudLayout from "@/app/components/crud/crud-layout";
import PageTitle from '@/app/components/PageTitle';
import TableForm from "@/app/forms/table/form";
import CrudTable from "@/app/components/crud/table";
import TableColumns from "@/app/entities/table/table-columns";
import { CheckboxField } from "@/app/components/modal/field";
import ButtonIconTextFloat from "@/app/components/button/button-float";
import Refresh, { FormatRefreshTime } from "@/app/components/crud/refresh";
import { useSession } from "next-auth/react";
import { useMemo, useEffect, useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import GetTables from "@/app/api/table/table";
import { notifyError } from "@/app/utils/notifications";

const PageTable = () => {
    const [showInactive, setShowInactive] = useState(false);
    const { data } = useSession();
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
    const [lastUpdate, setLastUpdate] = useState<string>(FormatRefreshTime(new Date()));

    const { isPending, error, data: tablesResponse, refetch } = useQuery({
        queryKey: ['tables', pagination.pageIndex, pagination.pageSize, !showInactive],
        queryFn: async () => {
            setLastUpdate(FormatRefreshTime(new Date()));
            return GetTables(data!, pagination.pageIndex, pagination.pageSize, !showInactive);
        },
        enabled: !!data?.user?.access_token,
        placeholderData: keepPreviousData,
    })

    useEffect(() => {
        if (error) {
            notifyError('Erro ao carregar tables');
        }
    }, [error]);

    const tables = useMemo(() => tablesResponse?.items || [], [tablesResponse?.items]);
    const totalCount = useMemo(() => parseInt(tablesResponse?.headers.get('X-Total-Count') || '0'), [tablesResponse?.items]);
    const sortedTables = useMemo(() => tables.sort((a, b) => a.name.localeCompare(b.name)), [tables]);

    return (
        <>
            {/* <ButtonIconTextFloat modalName="filter-table" icon={FaFilter}>
                <h1>Filtro</h1>
            </ButtonIconTextFloat> */}

            <ButtonIconTextFloat title="Nova mesa" modalName="new-table" position="bottom-right">
                <TableForm />
            </ButtonIconTextFloat>

            <CrudLayout title={<PageTitle title="Mesas" tooltip="Gerencie o cadastro de mesas, incluindo busca e filtro por nome." />}
                searchButtonChildren={
                    <>
                        {/* <TextField friendlyName="Nome" name="nome" placeholder="Digite o nome da mesa" setValue={setNome} value={nome} optional /> */}
                        <CheckboxField friendlyName="Mostrar inativos" name="show_inactive" value={showInactive} setValue={setShowInactive} />
                    </>
                }

                refreshButton={
                    <Refresh
                        onRefresh={refetch}
                        isPending={isPending}
                        lastUpdate={lastUpdate}
                    />
                }

                tableChildren={
                    <CrudTable
                        columns={TableColumns()}
                        data={sortedTables}
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
export default PageTable