'use client';

import EmployeeForm from "@/app/forms/employee/form";
import ButtonFilter from "@/app/components/crud/button-filter";
import ButtonPlus from "@/app/components/crud/button-plus";
import CrudLayout from "@/app/components/crud/layout";
import Menu from "@/app/components/menu/layout";
import CrudTable from "@/app/components/crud/table";
import EmployeeColumns from "@/app/entities/employee/table-columns";
import GetEmployees from "@/app/api/employee/route";
import Employee from "@/app/entities/employee/employee";
import { useCallback, useEffect, useState } from "react";
import Refresh, { FormatRefreshTime } from "@/app/components/crud/refresh";
import { useSession } from "next-auth/react";
import ModalHandler from "@/app/components/modal/modal";
import NewEmployee from "@/app/api/employee/new/route";
import FetchData from "@/app/api/fetch-data";

const PageEmployee = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const formattedTime = FormatRefreshTime(new Date());
    const [lastUpdate, setLastUpdate] = useState(formattedTime);
    const { data } = useSession();
    const modalHandler = ModalHandler();

    const fetchData = useCallback(async () => {
        if (!data) return;
        FetchData({ getItems: GetEmployees, setItems: setEmployees, data, setError, setLoading })
    }, [data?.user?.idToken!]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (loading) {
        return (
            <Menu><h1>Carregando página...</h1></Menu>
        )
    }
    
    return (
        <Menu>
            {error && <p className="mb-4 text-red-500">{error}</p>}
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
                            handleCloseModal={() => modalHandler.setShowModal(false)}/>
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
