'use client'

import CreateEmployeeForm from "@/app/forms/employee/create";
import ButtonFilter from "@/app/components/crud/button-filter";
import ButtonPlus from "@/app/components/crud/button-plus";
import CrudLayout from "@/app/components/crud/layout";
import Menu from "@/app/components/menu/layout";
import CrudTable from "@/app/components/crud/table";

const PageEmployee = () => {
    return (
        <Menu>
            <CrudLayout title="Funcionários"
                filterButtonChildren={<ButtonFilter name="funcionario" />}
                plusButtonChildren={<ButtonPlus name="funcionario" href="/employee/new"><CreateEmployeeForm /></ButtonPlus>}
                tableChildren={<CrudTable></CrudTable>} />
        </Menu>
    );
}

export default PageEmployee