'use client'

import CrudLayout from "@/app/components/crud/layout";
import Menu from "@/app/components/menu/layout";
import CreateClientForm from "@/app/forms/client/create";
import ButtonFilter from "@/app/components/crud/button-filter";
import ButtonPlus from "@/app/components/crud/button-plus";
import CrudTable from "@/app/components/crud/table";
import ProductColumns from "@/app/entities/product/table-columns";
import ClientColumns from "@/app/entities/client/table-columns";

const PageClient = () => {
    return (
        <Menu>
            <CrudLayout title="Clientes"
                filterButtonChildren={<ButtonFilter name="cliente" />}
                plusButtonChildren={<ButtonPlus name="cliente" href="/client/new"><CreateClientForm /></ButtonPlus>}
                tableChildren={<CrudTable columns={ClientColumns()} data={[]}></CrudTable>} />
        </Menu>
    );
}

export default PageClient