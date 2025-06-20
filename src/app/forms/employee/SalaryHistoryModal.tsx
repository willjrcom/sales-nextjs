import React, { useState } from "react";
import { createEmployeeSalaryHistory } from "@/app/api/employee/salary-history";
import { useSession } from "next-auth/react";
import { notifyError, notifySuccess } from "@/app/utils/notifications";
import { EmployeeSalaryHistory } from "@/app/entities/employee/employee-payment";
import PriceField from "@/app/components/modal/fields/price";

interface SalaryHistoryModalProps {
    employeeId: string;
    onClose: () => void;
    onSuccess: (newHistory: any) => void;
}

export default function SalaryHistoryModal({ employeeId, onClose, onSuccess }: SalaryHistoryModalProps) {
    const { data } = useSession();
    const [form, setForm] = useState<EmployeeSalaryHistory>({} as EmployeeSalaryHistory);
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!data) return;
        setLoading(true);
        try {
            const newHistory = await createEmployeeSalaryHistory(employeeId, form, data);
            notifySuccess("Histórico salarial lançado!");
            onSuccess(newHistory);
        } catch (err: any) {
            notifyError(err?.message || "Erro ao lançar histórico salarial");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-lg w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Alterar Salário</h2>
                <input name="startDate" type="date" value={form.start_date} onChange={handleChange} required className="mb-2 w-full border px-2 py-1 rounded" />
                <select name="Tipo" value={form.salary_type} onChange={handleChange} className="mb-2 w-full border px-2 py-1 rounded">
                    <option value="Fixed">Salário Fixo</option>
                    <option value="Variable">Salário Variavel</option>
                    <option value="Mixed">Salário Fixo + Variavel</option>
                </select>
                <PriceField name="baseSalary" placeholder="Salário Base" value={form.base_salary || 0} setValue={(value) => setForm({...form, base_salary: value})} />
                <PriceField name="hourlyRate" placeholder="Valor Hora" value={form.hourly_rate || 0} setValue={(value) => setForm({...form, hourly_rate: value})} />
                <PriceField name="commission" placeholder="Comissão" value={form.commission || 0} setValue={(value) => setForm({...form, commission: value})} />
                <div className="flex justify-end gap-2 mt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Cancelar</button>
                    <button type="submit" disabled={loading} className="px-4 py-2 bg-green-600 text-white rounded">{loading ? "Salvando..." : "Salvar"}</button>
                </div>
            </form>
        </div>
    );
} 