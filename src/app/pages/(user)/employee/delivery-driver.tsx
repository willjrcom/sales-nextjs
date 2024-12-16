'use client';

import DeliveryDriverForm from "@/app/forms/delivery-driver/form";
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

const PageDeliveryDriver = () => {
    const [nome, setNome] = useState<string>("");
    const deliveryDriversSlice = useSelector((state: RootState) => state.deliveryDrivers);
    const dispatch = useDispatch<AppDispatch>();
    const { data } = useSession();

    useEffect(() => {
        if (data && Object.keys(deliveryDriversSlice.entities).length === 0) {
            dispatch(fetchDeliveryDrivers(data));
        }
    
        const interval = setInterval(() => {
            if (data && !deliveryDriversSlice) {
                dispatch(fetchDeliveryDrivers(data));
            }
        }, 60000); // Atualiza a cada 60 segundos
    
        return () => clearInterval(interval); // Limpa o intervalo ao desmontar o componente
    }, [data, deliveryDriversSlice, dispatch]);
    
    if (deliveryDriversSlice.loading) {
        return (
            <h1>Carregando página...</h1>
        )
    }
    
    return (
        <>
        {deliveryDriversSlice.error && <p className="mb-4 text-red-500">{deliveryDriversSlice.error?.message}</p>}
            <CrudLayout
                title="Motoboys"
                searchButtonChildren={
                    <TextField friendlyName="Nome" name="nome" placeholder="Digite o nome do motoboy" setValue={setNome} value={nome} />
                }
                filterButtonChildren={
                    <ButtonIconTextFloat modalName="filter-delivery-driver" icon={FaFilter}>
                        <h1>Filtro</h1>
                    </ButtonIconTextFloat>
                }
                plusButtonChildren={
                    <ButtonIconTextFloat modalName="new-delivery-driver" position="bottom-right"
                        title="Novo motoboy">
                        <DeliveryDriverForm/>
                    </ButtonIconTextFloat>
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
                        data={Object.values(deliveryDriversSlice.entities).sort((a, b) => a.employee.name.localeCompare(b.employee.name))} />
                }
            />
        </>
    )
}
export default PageDeliveryDriver;
