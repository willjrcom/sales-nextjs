'use client';

import CrudLayout from "@/app/components/crud/layout";
import Menu from "@/app/components/menu/layout";
import ClientForm from "@/app/forms/client/form";
import ButtonFilter from "@/app/components/crud/button-filter";
import ButtonPlus from "@/app/components/crud/button-plus";
import CrudTable from "@/app/components/crud/table";
import ClientColumns from "@/app/entities/client/table-columns";
import Refresh from "@/app/components/crud/refresh";
import ModalHandler from "@/app/components/modal/modal";
import NewClient from "@/app/api/client/new/route";
import { ClientProvider, useClients } from "@/app/context/client/context";
import { TextField } from "@/app/forms/field";
import { useState } from "react";

const PageClient = () => {
  
    return (
        <Menu>
            <ClientProvider>
                <Crud />
            </ClientProvider>
        </Menu>
    );
}

const Crud = () => {
    const [nome, setNome] = useState<string>("");
    const context = useClients();
    const modalHandler = ModalHandler();

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
                    <ButtonPlus 
                        name="cliente" 
                        setModal={modalHandler.setShowModal} 
                        showModal={modalHandler.showModal}>
                        <ClientForm 
                            onSubmit={NewClient}/>
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
                        data={context.filterItems!('name', nome)}>
                    </CrudTable>} />
                    </>
    )
}
export default PageClient