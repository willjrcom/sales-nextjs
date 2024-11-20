'use client'

import CrudLayout from "@/app/components/crud/layout";
import Menu from "@/app/components/menu/layout";
import ClientForm from "@/app/forms/client/create";
import ButtonFilter from "@/app/components/crud/button-filter";
import ButtonPlus from "@/app/components/crud/button-plus";
import CrudTable from "@/app/components/crud/table";
import ClientColumns from "@/app/entities/client/table-columns";
import { useCallback, useEffect, useState } from "react";
import Client from "@/app/entities/client/client";
import GetClients from "@/app/api/client/route";
import Refresh, { FormatRefreshTime } from "@/app/components/crud/refresh";
import { useSession } from "next-auth/react";
import ModalHandler from "@/app/components/modal/modal";
import NewClient from "@/app/api/client/new/route";

const PageClient = () => {
    const [clients, setClients] = useState<Client[]>([])
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const formattedTime = FormatRefreshTime(new Date())
    const [lastUpdate, setLastUpdate] = useState(formattedTime);
    const { data, status } = useSession();
    const modalHandler = ModalHandler();

    const fetchData = useCallback(async () => {
        if (!data) return;
        
        try {
            const clients = await GetClients(data)
            setClients(clients);
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    }, [data]);

    useEffect(() => {
        if (status === "authenticated") {
            fetchData();
        }
    }, [data, status, fetchData]);

    return (
        <Menu>
            <CrudLayout title="Clientes"
                filterButtonChildren={
                    <ButtonFilter name="cliente" />
                }
                plusButtonChildren={
                    <ButtonPlus 
                        name="cliente" 
                        setModal={modalHandler.setShowModal} 
                        showModal={modalHandler.showModal}>
                        <ClientForm 
                            onSubmit={NewClient}
                            handleCloseModal={() => modalHandler.setShowModal(false)}
                            reloadData={fetchData}/>
                    </ButtonPlus>
                }
                refreshButton={
                    <Refresh 
                        lastUpdate={lastUpdate} 
                        setItems={setClients} 
                        getItems={GetClients} 
                        setLastUpdate={setLastUpdate} />
                }
                tableChildren={
                    <CrudTable 
                        columns={ClientColumns()} 
                        data={clients}>
                    </CrudTable>} />
        </Menu>
    );
}

export default PageClient