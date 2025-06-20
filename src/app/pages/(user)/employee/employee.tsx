'use client';

import EmployeeForm from "@/app/forms/employee/form";
import CrudLayout from "@/app/components/crud/layout";
import PageTitle from '@/app/components/PageTitle';
import CrudTable from "@/app/components/crud/table";
import EmployeeColumns from "@/app/entities/employee/table-columns";
import Refresh from "@/app/components/crud/refresh";
import { FaFilter } from "react-icons/fa";
import ButtonIconTextFloat from "@/app/components/button/button-float";
import { TextField } from "@/app/components/modal/field";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { fetchEmployees } from "@/redux/slices/employees";
import { useSession } from "next-auth/react";
import AddEmployeeAlreadyCreated from "@/app/forms/employee/add-already-created";

const PageEmployee = () => {
    const [nome, setNome] = useState<string>("");
    const employeesSlice = useSelector((state: RootState) => state.employees);
    const dispatch = useDispatch<AppDispatch>();
    const { data } = useSession();
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

    useEffect(() => {
        if (data && Object.keys(employeesSlice.entities).length === 0) {
            dispatch(fetchEmployees({ session: data, page: pagination.pageIndex, perPage: pagination.pageSize }));
        }
    }, [data?.user.access_token, pagination.pageIndex, pagination.pageSize, dispatch]);

    if (employeesSlice.loading) {
        return (
            <h1>Carregando página...</h1>
        )
    }

    const filteredEmployees = Object.values(employeesSlice.entities).filter(employee => employee.name.includes(nome)).sort((a, b) => a.name.localeCompare(b.name));

    return (
        <>
            <CrudLayout
                title={<PageTitle title="Funcionários" tooltip="Gerencie funcionários, filtrando e editando registros." />}
                searchButtonChildren={
                    <TextField friendlyName="Nome" name="nome" placeholder="Digite o nome do funcionário" setValue={setNome} value={nome} optional />
                }
                filterButtonChildren={
                    <ButtonIconTextFloat modalName="filter-employee" icon={FaFilter}>
                        <h1>Filtro</h1>
                    </ButtonIconTextFloat>
                }
                plusButtonChildren={
                    <ButtonIconTextFloat modalName="new-already-created-employee" position="bottom-right" size="xl"
                        title="Novo funcionário">
                        <AddEmployeeAlreadyCreated />
                    </ButtonIconTextFloat>
                }
                refreshButton={
                    <Refresh
                        slice={employeesSlice}
                        fetchItems={fetchEmployees}
                        page={pagination.pageIndex}
                        perPage={pagination.pageSize}
                    />
                }
                tableChildren={
                    <CrudTable
                        columns={EmployeeColumns()}
                        data={filteredEmployees} 
                        totalCount={employeesSlice.totalCount}
                        onPageChange={(pageIndex, pageSize) => {
                            setPagination({ pageIndex, pageSize });
                        }}/>
                }
            />
        </>
    )
}
export default PageEmployee;
