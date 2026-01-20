'use client';

import DeliveryDriverForm from "@/app/forms/delivery-driver/form";
import PageTitle from '@/app/components/PageTitle';
import CrudLayout from "@/app/components/crud/crud-layout";
import CrudTable from "@/app/components/crud/table";
import Refresh, { FormatRefreshTime } from "@/app/components/crud/refresh";
import { FaFilter } from "react-icons/fa";
import ButtonIconTextFloat from "@/app/components/button/button-float";
import { TextField, CheckboxField } from "@/app/components/modal/field";
import { useEffect, useMemo, useState } from "react";
import DeliveryDriverColumns from "@/app/entities/delivery-driver/table-columns";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import GetAllDeliveryDrivers from "@/app/api/delivery-driver/delivery-driver";
import { notifyError } from "@/app/utils/notifications";

const PageDeliveryDriver = () => {
    const [nome, setNome] = useState<string>("");
    const [showInactive, setShowInactive] = useState(false);
    const { data } = useSession();
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
    const [lastUpdate, setLastUpdate] = useState<string>(FormatRefreshTime(new Date()));

    const { isPending, error, data: deliveryDriversResponse, refetch } = useQuery({
        queryKey: ['delivery-drivers', pagination.pageIndex, pagination.pageSize, !showInactive],
        queryFn: async () => {
            setLastUpdate(FormatRefreshTime(new Date()));
            return GetAllDeliveryDrivers(data!, pagination.pageIndex, pagination.pageSize, !showInactive);
        },
        enabled: !!data?.user?.access_token,
    });

    useEffect(() => {
        if (error) notifyError('Erro ao carregar motoboys');
    }, [error]);

    const drivers = useMemo(() => (deliveryDriversResponse?.items || []).filter((driver) => !!driver.employee), [deliveryDriversResponse?.items]);
    const totalCount = useMemo(() => parseInt(deliveryDriversResponse?.headers.get('x-total-count') || '0'), [deliveryDriversResponse?.items]);

    const filteredDrivers = useMemo(() => drivers
        .filter((driver) => driver.employee.name.toLowerCase().includes(nome.toLowerCase()))
        .sort((a, b) => a.employee.name.localeCompare(b.employee.name)), [drivers, nome]);

    return (
        <>
            {/* <ButtonIconTextFloat modalName="filter-delivery-driver" icon={FaFilter}>
                <h1>Filtro</h1>
            </ButtonIconTextFloat> */}

            <ButtonIconTextFloat modalName="new-delivery-driver" position="bottom-right"
                title="Novo motoboy">
                <DeliveryDriverForm />
            </ButtonIconTextFloat>

            <CrudLayout
                title={<PageTitle title="Motoboys" tooltip="Gerencie motoboys e atribua entregas." />}
                searchButtonChildren={
                    <>
                        <TextField friendlyName="Nome" name="nome" placeholder="Digite o nome do motoboy" setValue={setNome} value={nome} optional />
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
                        columns={DeliveryDriverColumns()}
                        data={filteredDrivers}
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

export default PageDeliveryDriver;
