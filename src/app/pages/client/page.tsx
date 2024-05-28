'use client'

import CrudLayout from "@/app/components/crud/layout";
import Menu from "@/app/components/menu/layout";
import CreateClientForm from "@/app/forms/client/create";
import ButtonFilter from "@/app/components/crud/button-filter";
import ButtonPlus from "@/app/components/crud/button-plus";

const PageClient = () => {
    return (
        <body>
            <Menu>
                <CrudLayout title="Clientes" 
                    filterButtonChildren={<ButtonFilter name="cliente" />} 
                    plusButtonChildren={<ButtonPlus name="cliente" href="/client/new"><CreateClientForm/></ButtonPlus>} 
                    tableChildren={<p>dados</p>}/>
            </Menu>
        </body>
    );
}

export default PageClient