import React from "react";
import { Decimal } from "decimal.js";

interface SalaryHistory {
    id: string;
    start_date: string;
    end_date?: string;
    salary_type: string;
    base_salary: string;
    hourly_rate: string;
    commission: string;
}

const EmployeeSalaryHistoryList = ({ history }: { history: SalaryHistory[] }) => (
    <div className="bg-gray-50 rounded-lg p-4 shadow border mb-4">
        <h3 className="font-bold mb-4 text-lg text-blue-900">Histórico Salarial</h3>
        <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
                <thead className="bg-blue-100">
                    <tr>
                        <th className="px-3 py-2">Início</th>
                        <th className="px-3 py-2">Fim</th>
                        <th className="px-3 py-2">Tipo</th>
                        <th className="px-3 py-2">Salário Base</th>
                        <th className="px-3 py-2">Hora</th>
                        <th className="px-3 py-2">Comissão (%)</th>
                    </tr>
                </thead>
                <tbody>
                    {history.map(h => (
                        <tr key={h.id} className="border-b hover:bg-blue-50">
                            <td className="px-3 py-2">{new Date(h.start_date).toLocaleDateString()}</td>
                            <td className="px-3 py-2">{h.end_date ? new Date(h.end_date).toLocaleDateString() : "-"}</td>
                            <td className="px-3 py-2">{h.salary_type}</td>
                            <td className="px-3 py-2">R$ {new Decimal(h.base_salary).toFixed(2)}</td>
                            <td className="px-3 py-2">R$ {new Decimal(h.hourly_rate).toFixed(2)}</td>
                            <td className="px-3 py-2">{new Decimal(h.commission).mul(100).toFixed(2)}%</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

export default EmployeeSalaryHistoryList; 