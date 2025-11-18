'use client';

import DeliveryDriverForm from "@/app/forms/delivery-driver/form";
import PageTitle from '@/app/components/PageTitle';
import CrudLayout from "@/app/components/crud/layout";
import CrudTable from "@/app/components/crud/table";
import Refresh from "@/app/components/crud/refresh";
import { FaFilter } from "react-icons/fa";
import ButtonIconTextFloat from "@/app/components/button/button-float";
import { TextField } from "@/app/components/modal/field";
import { useEffect, useState } from "react";
import DeliveryDriverColumns from "@/app/entities/delivery-driver/table-columns";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { useSession } from "next-auth/react";
import { fetchDeliveryDrivers } from "@/redux/slices/delivery-drivers";
import DeliveryDriver from "@/app/entities/delivery-driver/delivery-driver";
import { FetchItemsArgs } from "@/redux/slices/generics";

const PageDeliveryDriver = () => {
    const [nome, setNome] = useState<string>("");
    const deliveryDriversSlice = useSelector((state: RootState) => state.deliveryDrivers);
    const [drivers, setDrivers] = useState<DeliveryDriver[]>([]);
    const dispatch = useDispatch<AppDispatch>();
    const { data } = useSession();
    const defaultPageSize = 10;
    useEffect(() => {
        const token = data?.user?.access_token;
        const hasDeliveryDrivers = deliveryDriversSlice.ids.length > 0;

        if (token && !hasDeliveryDrivers) {
            dispatch(fetchDeliveryDrivers({ session: data, page: 1, perPage: defaultPageSize } as FetchItemsArgs));
        }
    }, [data?.user?.access_token, deliveryDriversSlice.ids.length]);

    useEffect(() => {
        const driversFound = Object.values(deliveryDriversSlice.entities).filter((driver) => !!driver.employee);
        setDrivers(driversFound);
    }, [deliveryDriversSlice.entities]);

    const filteredDrivers = drivers.filter((driver) => driver.employee.name.toLowerCase().includes(nome.toLowerCase()))
        .sort((a, b) => a.employee.name.localeCompare(b.employee.name));

    return (
        <>
            <ButtonIconTextFloat modalName="filter-delivery-driver" icon={FaFilter}>
                <h1>Filtro</h1>
            </ButtonIconTextFloat>

            <ButtonIconTextFloat modalName="new-delivery-driver" position="bottom-right"
                title="Novo motoboy">
                <DeliveryDriverForm />
            </ButtonIconTextFloat>

            <CrudLayout
                title={<PageTitle title="Motoboys" tooltip="Gerencie motoboys e atribua entregas." />}
                searchButtonChildren={
                    <TextField friendlyName="Nome" name="nome" placeholder="Digite o nome do motoboy" setValue={setNome} value={nome} optional />
                }
                refreshButton={
                    <Refresh
                        slice={deliveryDriversSlice}
                        fetchItems={fetchDeliveryDrivers}
                    />
                }
                tableChildren={
                    <CrudTable
                        columns={DeliveryDriverColumns()}
                        data={filteredDrivers}
                        totalCount={deliveryDriversSlice.totalCount}
                        onPageChange={(newPage, newSize) => {
                            if (!data) return;
                            dispatch(fetchDeliveryDrivers({ session: data, page: newPage + 1, perPage: newSize } as FetchItemsArgs));
                        }}
                    />
                }
            />
        </>
    )
}
export default PageDeliveryDriver;
