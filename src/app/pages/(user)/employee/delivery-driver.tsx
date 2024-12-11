'use client';

import DeliveryDriverForm from "@/app/forms/delivery-driver/form";
import CrudLayout from "@/app/components/crud/layout";
import CrudTable from "@/app/components/crud/table";
import Refresh from "@/app/components/crud/refresh";
import { FaFilter } from "react-icons/fa";
import ButtonIconTextFloat from "@/app/components/button/button-float";
import { TextField } from "@/app/components/modal/field";
import { useState } from "react";
import { useDeliveryDrivers } from "@/app/context/delivery-driver/context";
import DeliveryDriverColumns from "@/app/entities/delivery-driver/table-columns";

const PageDeliveryDriver = () => {
    const context = useDeliveryDrivers();
    const [nome, setNome] = useState<string>("");
    
    if (context.getLoading()) {
        return (
            <h1>Carregando página...</h1>
        )
    }
    
    return (
        <>
        {context.getError() && <p className="mb-4 text-red-500">{context.getError()?.message}</p>}
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
                        context={context}
                    />
                }
                tableChildren={
                    <CrudTable 
                        columns={DeliveryDriverColumns()} 
                        data={context.items.sort((a, b) => a.employee.name.localeCompare(b.employee.name))} />
                }
            />
        </>
    )
}
export default PageDeliveryDriver;
