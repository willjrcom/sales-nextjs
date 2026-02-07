import React, { useMemo, useState } from "react";
import Employee from "@/app/entities/employee/employee";
import { useSession } from "next-auth/react";
import { notifySuccess } from "@/app/utils/notifications";
import { getEmployeeSalaryHistory } from "@/app/api/employee/salary-history";
import EmployeeSalaryHistoryList from "../list-employee-salary-history";
import SalaryHistoryModal from "../salary-history-modal";
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface EmployeeSalaryTabProps {
    item: Employee;
}

export default function EmployeeSalaryTab({ item }: EmployeeSalaryTabProps) {
    const { data } = useSession();
    const queryClient = useQueryClient();
    const [showSalaryModal, setShowSalaryModal] = useState(false);

    const { data: employeeSalaryResponse } = useQuery({
        queryKey: ['employee-salary', item.id],
        queryFn: () => getEmployeeSalaryHistory(item.id, data!),
        enabled: !!data?.user?.access_token,
    });

    const salaryHistory = useMemo(() => employeeSalaryResponse || [], [employeeSalaryResponse]);

    const handleSalaryHistorySuccess = (newHistory: any) => {
        queryClient.invalidateQueries({ queryKey: ['employee-salary', item.id] });
        notifySuccess('Histórico salarial atualizado com sucesso');
        setShowSalaryModal(false);
    };

    return (
        <>
            <div className="flex justify-end mb-4">
                <button
                    className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700 transition"
                    onClick={() => setShowSalaryModal(true)}
                >
                    Alterar Salário
                </button>
            </div>
            <EmployeeSalaryHistoryList history={salaryHistory} />
            {showSalaryModal && (
                <SalaryHistoryModal
                    employeeId={item.id}
                    onClose={() => setShowSalaryModal(false)}
                    onSuccess={handleSalaryHistorySuccess}
                />
            )}
        </>
    );
}
