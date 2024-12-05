'use client';

import CrudLayout from "@/app/components/crud/layout";
import ClientForm from "@/app/forms/client/form";
import CrudTable from "@/app/components/crud/table";
import ClientColumns from "@/app/entities/client/table-columns";
import Refresh from "@/app/components/crud/refresh";
import { useClients } from "@/app/context/client/context";
import { TextField } from "@/app/components/modal/field";
import { useState } from "react";
import ButtonIconTextFloat from "@/app/components/button/button-float";
import { FaFilter } from "react-icons/fa";

const PageClient = () => {
    const [nome, setNome] = useState<string>("");
    const context = useClients();

    return (
        <>
            {context.getError() && <p className="mb-4 text-red-500">{context.getError()?.message}</p>}
            <CrudLayout title="Clientes"
                searchButtonChildren={
                    <TextField friendlyName="Nome" name="nome" placeholder="Digite o nome do cliente" setValue={setNome} value={nome} />
                }
                filterButtonChildren={
                    <ButtonIconTextFloat modalName="filter-client" icon={FaFilter}><h1>Filtro</h1></ButtonIconTextFloat>
                }

                plusButtonChildren={
                    <ButtonIconTextFloat title="Novo cliente" modalName="new-client" position="bottom-right">
                        <ClientForm />
                    </ButtonIconTextFloat>
                }
                refreshButton={
                    <Refresh
                        context={context}
                    />
                }
                tableChildren={
                    <CrudTable
                        columns={ClientColumns()}
                        data={context.filterItems('name', nome).sort((a, b) => a.name.localeCompare(b.name))}>
                    </CrudTable>
                }
            />
        </>
    )
}
export default PageClient