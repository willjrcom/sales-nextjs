'use client'

import CrudLayout from "@/app/components/crud/layout";
import Menu from "@/app/components/menu/layout";
import CreateClientForm from "@/app/forms/client/create";
import ButtonFilter from "@/app/components/crud/button-filter";
import ButtonPlus from "@/app/components/crud/button-plus";
import CrudTable from "@/app/components/crud/table";
import ClientColumns from "@/app/entities/client/table-columns";
import { useEffect, useState } from "react";
import { Client } from "@/app/entities/client/client";
import GetClients from "@/app/api/client/route";

const PageClient = () => {
    const [clients, setClients] = useState<Client[]>([])
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const clients = await GetClients()
                setClients(clients);
            } catch (err) {
                setError((err as Error).message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <Menu>
            <CrudLayout title="Clientes"
                filterButtonChildren={<ButtonFilter name="cliente" />}
                plusButtonChildren={<ButtonPlus name="cliente" href="/client/new"><CreateClientForm /></ButtonPlus>}
                tableChildren={<CrudTable columns={ClientColumns()} data={clients}></CrudTable>} />
        </Menu>
    );
}

export default PageClient