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
import { fetchEmployees, fetchEmployeesDeleted } from "@/redux/slices/employees";
import { useSession } from "next-auth/react";
import AddEmployeeAlreadyCreated from "@/app/forms/employee/add-already-created";

const PageEmployee = () => {
    const [nome, setNome] = useState<string>("");
    const employeesSlice = useSelector((state: RootState) => state.employees);
    const employeesDeletedSlice = useSelector((state: RootState) => state.employeesDeleted);
    const dispatch = useDispatch<AppDispatch>();
    const { data } = useSession();
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
    const [showDeleted, setShowDeleted] = useState(false);

    useEffect(() => {
        if (data) {
            if (showDeleted) {
                if (Object.keys(employeesDeletedSlice.entities).length === 0) {
                    dispatch(fetchEmployeesDeleted({ session: data, page: pagination.pageIndex, perPage: pagination.pageSize }));
                }
            } else {
                if (Object.keys(employeesSlice.entities).length === 0) {
                    dispatch(fetchEmployees({ session: data, page: pagination.pageIndex, perPage: pagination.pageSize }));
                }
            }
        }
    }, [data?.user.access_token, pagination.pageIndex, pagination.pageSize, dispatch, showDeleted]);

    if ((showDeleted ? employeesDeletedSlice.loading : employeesSlice.loading)) {
        return (
            <h1>Carregando página...</h1>
        )
    }

    const filteredEmployees = Object.values(showDeleted ? employeesDeletedSlice.entities : employeesSlice.entities)
        .filter(employee => employee.name.includes(nome))
        .sort((a, b) => a.name.localeCompare(b.name));

    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
                <button
                    style={{
                        padding: '6px 16px',
                        borderRadius: 6,
                        border: '1px solid #ccc',
                        background: showDeleted ? '#f8d7da' : '#d4edda',
                        color: '#333',
                        cursor: 'pointer'
                    }}
                    onClick={() => setShowDeleted(v => !v)}
                >
                    {showDeleted ? 'Mostrar Ativos' : 'Mostrar Demitidos'}
                </button>
            </div>

            <ButtonIconTextFloat modalName="filter-employee" icon={FaFilter}>
                <h1>Filtro</h1>
            </ButtonIconTextFloat>

            !showDeleted && (
            <ButtonIconTextFloat modalName="new-already-created-employee" position="bottom-right" size="xl"
                title="Novo funcionário">
                <AddEmployeeAlreadyCreated />
            </ButtonIconTextFloat>
            )

            <CrudLayout
                title={<PageTitle title={showDeleted ? "Funcionários Demitidos" : "Funcionários"} tooltip="Gerencie funcionários, filtrando e editando registros." />}
                searchButtonChildren={
                    <TextField friendlyName="Nome" name="nome" placeholder="Digite o nome do funcionário" setValue={setNome} value={nome} optional />
                }
                refreshButton={
                    <Refresh
                        slice={showDeleted ? employeesDeletedSlice : employeesSlice}
                        fetchItems={showDeleted ? fetchEmployeesDeleted : fetchEmployees}
                        page={pagination.pageIndex}
                        perPage={pagination.pageSize}
                    />
                }
                tableChildren={
                    <CrudTable
                        columns={EmployeeColumns()}
                        data={filteredEmployees}
                        totalCount={showDeleted ? employeesDeletedSlice.totalCount : employeesSlice.totalCount}
                        onPageChange={(pageIndex, pageSize) => {
                            setPagination({ pageIndex, pageSize });
                        }} />
                }
            />
        </>
    )
}
export default PageEmployee;
