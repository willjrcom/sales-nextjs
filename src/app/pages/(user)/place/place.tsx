'use client';

import CrudLayout from "@/app/components/crud/crud-layout";
import PageTitle from '@/app/components/ui/page-title';
import PlaceForm from "@/app/forms/place/form";
import CrudTable from "@/app/components/crud/table";
import PlaceColumns from "@/app/entities/place/table-columns";
import { TextField, CheckboxField } from "@/app/components/modal/field";
import ButtonIconTextFloat from "@/app/components/button/button-float";
import Refresh, { FormatRefreshTime } from "@/app/components/crud/refresh";
import { useSession } from "next-auth/react";
import { useMemo, useEffect, useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import GetPlaces from "@/app/api/place/place";
import { notifyError } from "@/app/utils/notifications";

const PagePlace = () => {
    const [nome, setNome] = useState<string>("");
    const [showInactive, setShowInactive] = useState(false);
    const { data } = useSession();
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
    const [lastUpdate, setLastUpdate] = useState<string>(FormatRefreshTime(new Date()));

    const { isPending, error, data: placesResponse, refetch } = useQuery({
        queryKey: ['places', pagination.pageIndex, pagination.pageSize, !showInactive],
        queryFn: async () => {
            setLastUpdate(FormatRefreshTime(new Date()));
            return GetPlaces(data!, pagination.pageIndex, pagination.pageSize, !showInactive);
        },
        enabled: !!data?.user?.access_token,
        placeholderData: keepPreviousData,
    })

    useEffect(() => {
        if (error) {
            notifyError('Erro ao carregar ambientes');
        }
    }, [error]);

    const places = useMemo(() => placesResponse?.items || [], [placesResponse?.items]);
    const totalCount = useMemo(() => parseInt(placesResponse?.headers.get('X-Total-Count') || '0'), [placesResponse?.items]);
    const sortedPlaces = useMemo(() => {
        return places
            .filter(place => showInactive ? true : place.is_active)
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [places, showInactive]);

    return (
        <>
            {/* <ButtonIconTextFloat modalName="filter-place" icon={FaFilter}>
                <h1>Filtro</h1>
            </ButtonIconTextFloat> */}

            <ButtonIconTextFloat title="Novo ambiente" modalName="new-place" position="bottom-right">
                <PlaceForm />
            </ButtonIconTextFloat>

            <CrudLayout title={<PageTitle title="Ambientes" tooltip="Gerencie o cadastro de ambientes" />}
                searchButtonChildren={
                    <CheckboxField friendlyName="Mostrar inativos" name="show_inactive" value={showInactive} setValue={setShowInactive} />
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
                        columns={PlaceColumns()}
                        data={sortedPlaces}
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
export default PagePlace