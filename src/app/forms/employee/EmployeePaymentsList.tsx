import React from "react";
import { Decimal } from "decimal.js";

interface Payment {
    id: string;
    amount: string;
    payment_date: string;
    payment_type: string;
    reference_month: string;
    salary_history_id?: string;
}

const EmployeePaymentsList = ({ payments }: { payments: Payment[] }) => (
    <div className="bg-gray-50 rounded-lg p-4 shadow border mb-4">
        <h3 className="font-bold mb-4 text-lg text-blue-900">Pagamentos</h3>
        <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
                <thead className="bg-blue-100">
                    <tr>
                        <th className="px-3 py-2">Data</th>
                        <th className="px-3 py-2">Valor</th>
                        <th className="px-3 py-2">Tipo</th>
                        <th className="px-3 py-2">Referência</th>
                    </tr>
                </thead>
                <tbody>
                    {payments.map(p => (
                        <tr key={p.id} className="border-b hover:bg-blue-50">
                            <td className="px-3 py-2">{new Date(p.payment_date).toLocaleDateString()}</td>
                            <td className="px-3 py-2">R$ {new Decimal(p.amount).toFixed(2)}</td>
                            <td className="px-3 py-2">{p.payment_type}</td>
                            <td className="px-3 py-2">{p.reference_month}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

export default EmployeePaymentsList; 