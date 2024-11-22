'use client';

import EmployeeForm from "@/app/forms/employee/form";
import ButtonFilter from "@/app/components/crud/button-filter";
import ButtonPlus from "@/app/components/crud/button-plus";
import CrudLayout from "@/app/components/crud/layout";
import Menu from "@/app/components/menu/layout";
import CrudTable from "@/app/components/crud/table";
import EmployeeColumns from "@/app/entities/employee/table-columns";
import Refresh from "@/app/components/crud/refresh";
import ModalHandler from "@/app/components/modal/modal";
import { EmployeeProvider, useEmployees } from "@/app/context/employee/context";

const PageEmployee = () => {
    return (
        <Menu>
            <Crud />
        </Menu>
    );
};

const Crud = () => {
    const context = useEmployees();

    if (context.getLoading()) {
        return (
            <h1>Carregando página...</h1>
        )
    }
    
    return (
        <>
        {context.getError() && <p className="mb-4 text-red-500">{context.getError()}</p>}
            <CrudLayout
                title="Funcionários"
                filterButtonChildren={
                    <ButtonFilter><h1>meu filtro</h1></ButtonFilter>
                }
                plusButtonChildren={
                    <ButtonPlus 
                        name="funcionario">
                        <EmployeeForm/>
                    </ButtonPlus>
                }
                refreshButton={
                    <Refresh
                        context={context}
                    />
                }
                tableChildren={
                    <CrudTable 
                        columns={EmployeeColumns()} 
                        data={context.items} />
                }
            />
        </>
    )
}
export default PageEmployee;
