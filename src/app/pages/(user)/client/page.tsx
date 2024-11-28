'use client';

import CrudLayout from "@/app/components/crud/layout";
import ClientForm from "@/app/forms/client/form";
import ButtonPlus from "@/app/components/crud/button-plus";
import CrudTable from "@/app/components/crud/table";
import ClientColumns from "@/app/entities/client/table-columns";
import Refresh from "@/app/components/crud/refresh";
import { useClients } from "@/app/context/client/context";
import { TextField } from "@/app/components/modal/field";
import { useState } from "react";

const PageClient = () => {
    const [nome, setNome] = useState<string>("");
    const context = useClients();

    if (context.getLoading()) {
        return (
            <h1>Carregando página...</h1>
        )
    }

    return (
        <>
        {context.getError() && <p className="mb-4 text-red-500">{context.getError()}</p>}
            <CrudLayout title="Clientes"
                filterButtonChildren={
                    <TextField friendlyName="Nome" name="nome" placeholder="Digite o nome do cliente" setValue={setNome} value={nome} />
                }
                plusButtonChildren={
                    <ButtonPlus name="cliente" modalName="new-client">
                        <ClientForm/>
                    </ButtonPlus>
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