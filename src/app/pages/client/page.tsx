'use client'

import CrudLayout from "@/components/crud/layout";
import Menu from "@/components/menu/layout";
import CreateClientForm from "@/app/forms/client/create";
import ButtonFilter from "@/components/crud/button-filter";
import ButtonPlus from "@/components/crud/button-plus";

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