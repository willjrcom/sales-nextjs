import React from "react";
import { Decimal } from "decimal.js";
import { EmployeePayment } from "@/app/entities/employee/employee-payment";
import { ToUtcDate, ToUtcDatetime } from "@/app/utils/date";
import { HiOutlineCreditCard, HiOutlineDocumentText } from "react-icons/hi";

const EmployeePaymentsList = ({ payments }: { payments: EmployeePayment[] }) => (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="flex items-center gap-3 mb-6">
            <div className="bg-green-100 text-green-600 rounded-lg p-2">
                <HiOutlineCreditCard size={24} />
            </div>
            <h3 className="font-bold text-xl text-gray-800">Pagamentos</h3>
        </div>

        <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Data lançamento</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Data pagamento</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Valor</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Observação</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {payments.length === 0 ? (
                        <tr>
                            <td colSpan={4} className="px-4 py-8">
                                <div className="flex flex-col items-center justify-center text-center">
                                    <div className="bg-gray-100 text-gray-400 rounded-full p-4 mb-3">
                                        <HiOutlineDocumentText size={32} />
                                    </div>
                                    <p className="text-gray-500 font-medium mb-1">Nenhum pagamento registrado</p>
                                    <p className="text-gray-400 text-sm">Adicione o primeiro pagamento para começar</p>
                                </div>
                            </td>
                        </tr>
                    ) : (
                        payments.map(p => (
                            <tr key={p.id} className="hover:bg-gray-50 transition-colors duration-150">
                                <td className="px-4 py-3 text-gray-700">{ToUtcDatetime(p.created_at)}</td>
                                <td className="px-4 py-3 text-gray-700">{ToUtcDate(p.payment_date)}</td>
                                <td className="px-4 py-3 font-medium text-gray-900">R$ {new Decimal(p.amount).toFixed(2)}</td>
                                <td className="px-4 py-3">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        {p.status}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-gray-700 max-w-xs truncate" title={p.notes}>
                                    {p.notes || "-"}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    </div>
);

export default EmployeePaymentsList; 