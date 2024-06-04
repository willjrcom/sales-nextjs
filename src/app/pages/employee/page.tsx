'use client'

import CreateEmployeeForm from "@/app/forms/employee/create";
import ButtonFilter from "@/app/components/crud/button-filter";
import ButtonPlus from "@/app/components/crud/button-plus";
import CrudLayout from "@/app/components/crud/layout";
import Menu from "@/app/components/menu/layout";
import CrudTable from "@/app/components/crud/table";
import EmployeeColumns from "@/app/entities/employee/table-columns";
import GetEmployees from "@/app/api/employee/route";
import { Employee } from "@/app/entities/employee/employee";
import { useEffect, useState } from "react";
import Refresh, { FormatRefreshTime } from "@/app/components/crud/refresh";
import { useSession } from "next-auth/react";

const PageEmployee = () => {
    const [employees, setEmployees] = useState<Employee[]>([])
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const formattedTime = FormatRefreshTime(new Date())
    const [lastUpdate, setLastUpdate] = useState(formattedTime);
    const { data: session } = useSession();

    useEffect(() => {
        const fetchData = async () => {
            if (!session) return;

            try {
                let newEmployees = await GetEmployees(session)
                setEmployees(newEmployees);
            } catch (err) {
                console.error("Error fetching employees: ", err);
                setError((err as Error).message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [session]);

    return (
        <Menu>
            <CrudLayout
                title="Funcionários"
                filterButtonChildren={<ButtonFilter name="funcionario" />}
                plusButtonChildren={
                    <ButtonPlus name="funcionario" href="/employee/new">
                        <CreateEmployeeForm />
                    </ButtonPlus>
                }
                refreshButton={
                    <Refresh
                        lastUpdate={lastUpdate}
                        setItems={setEmployees}
                        getItems={GetEmployees}
                        setLastUpdate={setLastUpdate}
                    />
                }
                tableChildren={
                    <CrudTable columns={EmployeeColumns()} data={employees} />
                }
            />
        </Menu>
    );
}

export default PageEmployee