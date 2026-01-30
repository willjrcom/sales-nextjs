import React from "react";
import { Decimal } from "decimal.js";
import { EmployeeSalaryHistory } from "@/app/entities/employee/employee-payment";
import { ToUtcDatetime, ToUtcHoursMinutes } from "@/app/utils/date";
import { HiOutlineClock, HiOutlineCurrencyDollar, HiOutlineDocumentText } from "react-icons/hi";

const EmployeeSalaryHistoryList = ({ history: histories }: { history: EmployeeSalaryHistory[] }) => (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-100 text-blue-600 rounded-lg p-2">
                <HiOutlineCurrencyDollar size={24} />
            </div>
            <h3 className="font-bold text-xl text-gray-800">Histórico Salarial</h3>
        </div>
        
        <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Início</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Fim</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Tipo</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Salário Base</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Hora</th>
                        {/* <th className="px-4 py-3 text-left font-semibold text-gray-700">Comissão</th> */}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {histories.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="px-4 py-8">
                                <div className="flex flex-col items-center justify-center text-center">
                                    <div className="bg-gray-100 text-gray-400 rounded-full p-4 mb-3">
                                        <HiOutlineDocumentText size={32} />
                                    </div>
                                    <p className="text-gray-500 font-medium mb-1">Nenhum histórico salarial</p>
                                    <p className="text-gray-400 text-sm">Adicione o primeiro registro de salário para começar</p>
                                </div>
                            </td>
                        </tr>
                    ) : (
                        histories.map(h => (
                            <tr key={h.id} className="hover:bg-gray-50 transition-colors duration-150">
                                <td className="px-4 py-3 text-gray-700">{ToUtcDatetime(h.start_date)}</td>
                                <td className="px-4 py-3 text-gray-700">{h.end_date ? ToUtcDatetime(h.end_date) : "-"}</td>
                                <td className="px-4 py-3">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        {h.salary_type}
                                    </span>
                                </td>
                                <td className="px-4 py-3 font-medium text-gray-900">R$ {new Decimal(h.base_salary).toFixed(2)}</td>
                                <td className="px-4 py-3 font-medium text-gray-900">R$ {new Decimal(h.hourly_rate).toFixed(2)}</td>
                                {/* <td className="px-4 py-3">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        {new Decimal(h.commission).mul(100).toFixed(2)}%
                                    </span>
                                </td> */}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    </div>
);

export default EmployeeSalaryHistoryList; 