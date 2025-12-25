'use client';

import CrudLayout from "@/app/components/crud/crud-layout";
import PageTitle from '@/app/components/PageTitle';
import CrudTable from "@/app/components/crud/table";
import EmployeeColumns from "@/app/entities/employee/table-columns";
import Refresh, { FormatRefreshTime } from "@/app/components/crud/refresh";
import { FaFilter } from "react-icons/fa";
import ButtonIconTextFloat from "@/app/components/button/button-float";
import { TextField } from "@/app/components/modal/field";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import AddEmployeeAlreadyCreated from "@/app/forms/employee/add-already-created";
import { useQuery } from "@tanstack/react-query";
import GetEmployees, { GetEmployeesDeleted } from "@/app/api/employee/employee";
import { notifyError } from "@/app/utils/notifications";

const PageEmployee = () => {
    const [nome, setNome] = useState<string>("");
    const { data } = useSession();
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
    const [showDeleted, setShowDeleted] = useState(false);
    const [lastUpdate, setLastUpdate] = useState<string>(FormatRefreshTime(new Date()));

    const { isPending: employeesPending, error: employeesError, data: employeesResponse, refetch: refetchEmployees } = useQuery({
        queryKey: ['employees', pagination.pageIndex, pagination.pageSize],
        queryFn: async () => {
            setLastUpdate(FormatRefreshTime(new Date()));
            return GetEmployees(data!, pagination.pageIndex, pagination.pageSize);
        },
        enabled: !!data?.user?.access_token && !showDeleted,
    });

    const { isPending: employeesDeletedPending, error: employeesDeletedError, data: employeesDeletedResponse, refetch: refetchEmployeesDeleted } = useQuery({
        queryKey: ['employees-deleted', pagination.pageIndex, pagination.pageSize],
        queryFn: async () => {
            setLastUpdate(FormatRefreshTime(new Date()));
            return GetEmployeesDeleted(data!, pagination.pageIndex, pagination.pageSize);
        },
        enabled: !!data?.user?.access_token && showDeleted,
    });

    useEffect(() => {
        if (employeesError) notifyError('Erro ao carregar funcionários');
    }, [employeesError]);

    useEffect(() => {
        if (employeesDeletedError) notifyError('Erro ao carregar funcionários demitidos');
    }, [employeesDeletedError]);

    const employeesDeleted = useMemo(() => employeesDeletedResponse?.items || [], [employeesDeletedResponse]);
    const employees = useMemo(() => employeesResponse?.items || [], [employeesResponse]);

    const items = useMemo(() => showDeleted ? employeesDeleted : employees, [showDeleted, employeesDeleted, employees]);

    const totalCount = useMemo(() => showDeleted ? 
        (employeesDeletedResponse ? parseInt(employeesDeletedResponse.headers.get('x-total-count') || '0') : 0) : 
        (employeesResponse ? parseInt(employeesResponse.headers.get('x-total-count') || '0') : 0), [showDeleted, employeesDeletedResponse, employeesResponse]);

    const filteredEmployees = useMemo(() => items
        .filter(employee => employee.name.includes(nome))
        .sort((a, b) => a.name.localeCompare(b.name)), [items, nome]);

    const isPending = useMemo(() => employeesPending || employeesDeletedPending, [employeesPending, employeesDeletedPending]); 
    const refetch = useMemo(() => showDeleted ? refetchEmployeesDeleted : refetchEmployees, [showDeleted, refetchEmployeesDeleted, refetchEmployees]);

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

            {!showDeleted && (
            <ButtonIconTextFloat modalName="new-already-created-employee" position="bottom-right" size="xl"
                title="Novo funcionário">
                <AddEmployeeAlreadyCreated />
            </ButtonIconTextFloat>
            )}

            <CrudLayout
                title={<PageTitle title={showDeleted ? "Funcionários Demitidos" : "Funcionários"} tooltip="Gerencie funcionários, filtrando e editando registros." />}
                searchButtonChildren={
                    <TextField friendlyName="Nome" name="nome" placeholder="Digite o nome do funcionário" setValue={setNome} value={nome} optional />
                }
                refreshButton={
                    <Refresh
                        onRefresh={refetch}
                        isPending={isPending}
                        lastUpdate={lastUpdate}
                    />
                }
                tableChildren={
                    <CrudTable
                        columns={EmployeeColumns()}
                        data={filteredEmployees}
                        totalCount={totalCount}
                        onPageChange={(pageIndex, pageSize) => {
                            setPagination({ pageIndex, pageSize });
                        }} />
                }
            />
        </>
    )
}
export default PageEmployee;
