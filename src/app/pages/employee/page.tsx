'use client'

import CreateEmployeeForm from "@/app/forms/employee/create";
import ButtonFilter from "@/app/components/crud/button-filter";
import ButtonPlus from "@/app/components/crud/button-plus";
import CrudLayout from "@/app/components/crud/layout";
import Menu from "@/app/components/menu/layout";

const PageEmployee = () => {
    return (
        <body>
            <Menu>
                <CrudLayout title="Funcionários" 
                    filterButtonChildren={<ButtonFilter name="Funcionário" />} 
                    plusButtonChildren={<ButtonPlus name="Funcionário" href="/employee/new"><CreateEmployeeForm/></ButtonPlus>} 
                    tableChildren={<p>dados</p>}/>
            </Menu>
        </body>
    );
}

export default PageEmployee