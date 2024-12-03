'use client';

import EmployeeForm from "@/app/forms/employee/form";
import ButtonIconText from "@/app/components/crud/button-icon-text";
import CrudLayout from "@/app/components/crud/layout";
import CrudTable from "@/app/components/crud/table";
import EmployeeColumns from "@/app/entities/employee/table-columns";
import Refresh from "@/app/components/crud/refresh";
import { useEmployees } from "@/app/context/employee/context";
import { FaFilter } from "react-icons/fa";

const PageEmployee = () => {
    const context = useEmployees();

    if (context.getLoading()) {
        return (
            <h1>Carregando página...</h1>
        )
    }
    
    return (
        <>
        {context.getError() && <p className="mb-4 text-red-500">{context.getError()?.message}</p>}
            <CrudLayout
                title="Funcionários"
                filterButtonChildren={
                    <ButtonIconText modalName="filter-employee" icon={FaFilter}>
                        <h1>Filtro</h1>
                    </ButtonIconText>
                }
                plusButtonChildren={
                    <ButtonIconText modalName="new-employee"
                        title="Novo funcionario">
                        <EmployeeForm/>
                    </ButtonIconText>
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
