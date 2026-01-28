'use client';

import CrudLayout from "@/app/components/crud/crud-layout";
import PageTitle from '@/app/components/ui/page-title';
import CrudTable from "@/app/components/crud/table";
import EmployeeColumns from "@/app/entities/employee/table-columns";
import Refresh, { FormatRefreshTime } from "@/app/components/crud/refresh";
import { FaFilter } from "react-icons/fa";
import ButtonIconTextFloat from "@/app/components/button/button-float";
import { TextField, CheckboxField } from "@/app/components/modal/field";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import AddEmployeeAlreadyCreated from "@/app/forms/employee/add-already-created";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import GetEmployees from "@/app/api/employee/employee";
import { notifyError } from "@/app/utils/notifications";

const PageEmployee = () => {
    const [nome, setNome] = useState<string>("");
    const [showInactive, setShowInactive] = useState(false);
    const { data } = useSession();
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
    const [lastUpdate, setLastUpdate] = useState<string>(FormatRefreshTime(new Date()));

    const { isPending, error, data: employeesResponse, refetch } = useQuery({
        queryKey: ['employees', pagination.pageIndex, pagination.pageSize, !showInactive],
        queryFn: async () => {
            setLastUpdate(FormatRefreshTime(new Date()));
            return GetEmployees(data!, pagination.pageIndex, pagination.pageSize, !showInactive);
        },
        enabled: !!data?.user?.access_token,
        placeholderData: keepPreviousData,
    });

    useEffect(() => {
        if (error) notifyError('Erro ao carregar funcionários');
    }, [error]);

    const employees = useMemo(() => employeesResponse?.items || [], [employeesResponse?.items]);
    const totalCount = useMemo(() => parseInt(employeesResponse?.headers.get('X-Total-Count') || '0'), [employeesResponse?.items]);

    const filteredEmployees = useMemo(() => employees
        .filter(employee => employee.name.includes(nome))
        .sort((a, b) => a.name.localeCompare(b.name)), [employees, nome]);

    return (
        <>
            {/* <ButtonIconTextFloat modalName="filter-employee" icon={FaFilter}>
                <h1>Filtro</h1>
            </ButtonIconTextFloat> */}

            <ButtonIconTextFloat modalName="new-already-created-employee" position="bottom-right" size="xl"
                title="Novo funcionário">
                <AddEmployeeAlreadyCreated />
            </ButtonIconTextFloat>

            <CrudLayout
                title={<PageTitle title="Funcionários" tooltip="Gerencie funcionários, filtrando e editando registros." />}
                searchButtonChildren={
                    <>
                        <TextField friendlyName="Nome" name="nome" placeholder="Digite o nome do funcionário" setValue={setNome} value={nome} optional />
                        <CheckboxField friendlyName="Mostrar inativos" name="show_inactive" value={showInactive} setValue={setShowInactive} />
                    </>
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
