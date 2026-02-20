import React, { useMemo, useState } from "react";
import Employee from "@/app/entities/employee/employee";
import { useSession } from "next-auth/react";
import { notifySuccess } from "@/app/utils/notifications";
import { getEmployeePayments } from "@/app/api/employee/payments";
import EmployeePaymentsList from "../list-employee-payments";
import PaymentModal from "../payment-modal";
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface EmployeePaymentsTabProps {
    item: Employee;
}

export default function EmployeePaymentsTab({ item }: EmployeePaymentsTabProps) {
    const { data } = useSession();
    const queryClient = useQueryClient();
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    const { data: employeePaymentsResponse } = useQuery({
        queryKey: ['employee-payments', item.id],
        queryFn: () => getEmployeePayments(item.id, data!),
        enabled: !!data?.user?.access_token,
    });

    const payments = useMemo(() => employeePaymentsResponse || [], [employeePaymentsResponse]);

    const handlePaymentSuccess = (newPayment: any) => {
        queryClient.invalidateQueries({ queryKey: ['employee-payments', item.id] });
        setShowPaymentModal(false);
    };

    return (
        <>
            <div className="flex justify-end mb-4">
                <button
                    className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition"
                    onClick={() => setShowPaymentModal(true)}
                >
                    Novo Pagamento
                </button>
            </div>
            <EmployeePaymentsList payments={payments} />
            {showPaymentModal && (
                <PaymentModal
                    employeeId={item.id}
                    onClose={() => setShowPaymentModal(false)}
                    onSuccess={handlePaymentSuccess}
                />
            )}
        </>
    );
}
