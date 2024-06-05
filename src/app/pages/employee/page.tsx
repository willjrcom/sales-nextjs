'use client'

import EmployeeForm from "@/app/forms/employee/form";
import ButtonFilter from "@/app/components/crud/button-filter";
import ButtonPlus from "@/app/components/crud/button-plus";
import CrudLayout from "@/app/components/crud/layout";
import Menu from "@/app/components/menu/layout";
import CrudTable from "@/app/components/crud/table";
import EmployeeColumns from "@/app/entities/employee/table-columns";
import GetEmployees from "@/app/api/employee/route";
import Employee from "@/app/entities/employee/employee";
import { useEffect, useState } from "react";
import Refresh, { FormatRefreshTime } from "@/app/components/crud/refresh";
import { useSession } from "next-auth/react";
import ModalHandler from "@/app/components/modal/modal";
import NewEmployee from "@/app/api/employee/new/route";

const PageEmployee = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const formattedTime = FormatRefreshTime(new Date());
    const [lastUpdate, setLastUpdate] = useState(formattedTime);
    const { data, status } = useSession();
    const modalHandler = ModalHandler();

    const fetchData = async () => {
        if (!data) return;

        try {
            setLoading(true);
            let newEmployees = await GetEmployees(data);
            setEmployees(newEmployees);
        } catch (err) {
            console.error("Error fetching employees: ", err);
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (status === "authenticated") {
            fetchData();
        }
    }, [status, data]);

    return (
        <Menu>
            <CrudLayout
                title="Funcionários"
                filterButtonChildren={<ButtonFilter name="funcionario" />}
                plusButtonChildren={
                    <ButtonPlus 
                        name="funcionario" 
                        showModal={modalHandler.showModal} 
                        setModal={modalHandler.setShowModal}>
                        <EmployeeForm 
                            onSubmit={NewEmployee}
                            handleCloseModal={() => modalHandler.setShowModal(false)}
                            reloadData={fetchData}/>
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
                    <CrudTable 
                        columns={EmployeeColumns()} 
                        data={employees} />
                }
            />
        </Menu>
    );
};

export default PageEmployee;
