'use client';

import CrudLayout from "@/app/components/crud/layout";
import ClientForm from "@/app/forms/client/form";
import ButtonIconText from "@/app/components/button/button-icon-text";
import CrudTable from "@/app/components/crud/table";
import ClientColumns from "@/app/entities/client/table-columns";
import Refresh from "@/app/components/crud/refresh";
import { useClients } from "@/app/context/client/context";
import { TextField } from "@/app/components/modal/field";
import { useState } from "react";

const PageClient = () => {
    const [nome, setNome] = useState<string>("");
    const context = useClients();

    return (
        <>
        {context.getError() && <p className="mb-4 text-red-500">{context.getError()?.message}</p>}
            <CrudLayout title="Clientes"
                filterButtonChildren={
                    <TextField friendlyName="Nome" name="nome" placeholder="Digite o nome do cliente" setValue={setNome} value={nome} />
                }
                plusButtonChildren={
                    <ButtonIconText title="Novo cliente" modalName="new-client">
                        <ClientForm/>
                    </ButtonIconText>
                }
                refreshButton={
                    <Refresh 
                    context={context}
                    />
                }
                tableChildren={
                    <CrudTable 
                        columns={ClientColumns()} 
                        data={context.filterItems('name', nome)}>
                    </CrudTable>
                } 
            />
        </>
    )
}
export default PageClient