'use client';

import CrudLayout from "@/app/components/crud/crud-layout";
import PageTitle from '@/app/components/ui/page-title';
import ClientForm from "@/app/forms/client/form";
import CrudTable from "@/app/components/crud/table";
import ClientColumns from "@/app/entities/client/table-columns";
import { TextField, CheckboxField } from "@/app/components/modal/field";
import ButtonIconTextFloat from "@/app/components/button/button-float";
import { FaFilter } from "react-icons/fa";
import Refresh, { FormatRefreshTime } from "@/app/components/crud/refresh";
import { useSession } from "next-auth/react";
import { useMemo, useEffect, useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import GetClients from "@/app/api/client/client";
import { notifyError } from "@/app/utils/notifications";

const PageClient = () => {
    const [nome, setNome] = useState<string>("");
    const [showInactive, setShowInactive] = useState(false);
    const { data } = useSession();
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
    const [lastUpdate, setLastUpdate] = useState<string>(FormatRefreshTime(new Date()));

    const { isPending, error, data: clientsResponse, refetch } = useQuery({
        queryKey: ['clients', pagination.pageIndex, pagination.pageSize, !showInactive],
        queryFn: async () => {
            setLastUpdate(FormatRefreshTime(new Date()));
            return GetClients(data!, pagination.pageIndex, pagination.pageSize, !showInactive);
        },
        enabled: !!data?.user?.access_token,
        placeholderData: keepPreviousData,
    })

    useEffect(() => {
        if (error) {
            notifyError('Erro ao carregar clientes');
        }
    }, [error]);

    const clients = useMemo(() => clientsResponse?.items || [], [clientsResponse?.items]);
    const totalCount = useMemo(() => parseInt(clientsResponse?.headers.get('X-Total-Count') || '0'), [clientsResponse?.items]);

    const sortedClients = useMemo(() => {
        return clients
            .filter(client => showInactive ? true : client.is_active)
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [clients, showInactive]);

    return (
        <>
            {/* <ButtonIconTextFloat modalName="filter-client" icon={FaFilter}>
                <h1>Filtro</h1>
            </ButtonIconTextFloat> */}

            <ButtonIconTextFloat title="Novo cliente" modalName="new-client" position="bottom-right">
                <ClientForm />
            </ButtonIconTextFloat>

            <CrudLayout title={<PageTitle title="Clientes" tooltip="Gerencie o cadastro de clientes, incluindo busca e filtro por nome." />}
                searchButtonChildren={
                    <>
                        <TextField friendlyName="Nome" name="nome" placeholder="Digite o nome do cliente" setValue={setNome} value={nome} optional />
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
                        columns={ClientColumns()}
                        data={sortedClients}
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
export default PageClient