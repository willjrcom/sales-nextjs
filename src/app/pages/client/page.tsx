'use client'

import CrudLayout from "@/app/components/crud/layout";
import Menu from "@/app/components/menu/layout";
import CreateClientForm from "@/app/forms/client/create";
import ButtonFilter from "@/app/components/crud/button-filter";
import ButtonPlus from "@/app/components/crud/button-plus";
import CrudTable from "@/app/components/crud/table";
import ClientColumns from "@/app/entities/client/table-columns";
import GetClients from "@/app/api/client/route";

// eslint-disable-next-line @next/next/no-async-client-component
const PageClient = async () => {
    const clients = await GetClients()

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