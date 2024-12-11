'use client';

import EmployeeForm from "@/app/forms/employee/form";
import CrudLayout from "@/app/components/crud/layout";
import CrudTable from "@/app/components/crud/table";
import EmployeeColumns from "@/app/entities/employee/table-columns";
import Refresh from "@/app/components/crud/refresh";
import { useEmployees } from "@/app/context/employee/context";
import { FaFilter } from "react-icons/fa";
import ButtonIconTextFloat from "@/app/components/button/button-float";
import { TextField } from "@/app/components/modal/field";
import { useState } from "react";

const PageEmployee = () => {
    const context = useEmployees();
    const [nome, setNome] = useState<string>("");

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
                searchButtonChildren={
                    <TextField friendlyName="Nome" name="nome" placeholder="Digite o nome do funcionário" setValue={setNome} value={nome} />
                }
                filterButtonChildren={
                    <ButtonIconTextFloat modalName="filter-employee" icon={FaFilter}>
                        <h1>Filtro</h1>
                    </ButtonIconTextFloat>
                }
                plusButtonChildren={
                    <ButtonIconTextFloat modalName="new-employee" position="bottom-right"
                        title="Novo funcionario">
                        <EmployeeForm/>
                    </ButtonIconTextFloat>
                }
                refreshButton={
                    <Refresh
                        context={context}
                    />
                }
                tableChildren={
                    <CrudTable 
                        columns={EmployeeColumns()} 
                        data={context.filterItems('name', nome).sort((a, b) => a.name.localeCompare(b.name))} />
                }
            />
        </>
    )
}
export default PageEmployee;
