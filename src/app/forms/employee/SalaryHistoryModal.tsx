import React, { useState } from "react";
import { createEmployeeSalaryHistory } from "@/app/api/employee/salary-history";
import { useSession } from "next-auth/react";
import { notifyError, notifySuccess } from "@/app/utils/notifications";
import { EmployeeSalaryHistory } from "@/app/entities/employee/employee-payment";
import PriceField from "@/app/components/modal/fields/price";
import { DateField, NumberField } from "@/app/components/modal/field";
import TextField from "@/app/components/modal/fields/text";
import SelectField from "@/app/components/modal/fields/select";

interface SalaryHistoryModalProps {
    employeeId: string;
    onClose: () => void;
    onSuccess: (newHistory: any) => void;
}

export default function SalaryHistoryModal({ employeeId, onClose, onSuccess }: SalaryHistoryModalProps) {
    const { data } = useSession();
    const [form, setForm] = useState<EmployeeSalaryHistory>({ salary_type: "Fixed", commission: 0 } as EmployeeSalaryHistory);
    const [loading, setLoading] = useState(false);

    const handleInputChange = (field: keyof EmployeeSalaryHistory, value: any) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!data) return;
        setLoading(true);
        try {
            const { id, ...payload } = form;
            const newHistory = await createEmployeeSalaryHistory(employeeId, payload, data);
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
                <DateField
                    name="start_date"
                    friendlyName="Início"
                    value={form.start_date || ""}
                    setValue={value => handleInputChange('start_date', value)}
                />
                <SelectField
                    name="salary_type"
                    friendlyName="Tipo"
                    selectedValue={form.salary_type || "Fixed"}
                    setSelectedValue={value => handleInputChange('salary_type', value)}
                    values={[
                        { id: "Fixed", name: "Salário Fixo" },
                        { id: "Variable", name: "Salário Variável" },
                        { id: "Mixed", name: "Salário Fixo + Variável" },
                    ]}
                />
                <PriceField name="baseSalary" friendlyName="Base salarial" placeholder="Salário Base" value={form.base_salary || 0} setValue={value => handleInputChange('base_salary', value)} />
                <PriceField name="hourlyRate" friendlyName="Valor por hora adicional" placeholder="Valor Hora" value={form.hourly_rate || 0} setValue={value => handleInputChange('hourly_rate', value)} />
                <NumberField
                    name="commission"
                    friendlyName="Comissão"
                    placeholder="Comissão"
                    value={typeof form.commission === "number" ? form.commission : Number(form.commission) || 0}
                    setValue={value => handleInputChange('commission', value)}
                />
                <div className="flex justify-end gap-2 mt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Cancelar</button>
                    <button type="submit" disabled={loading} className="px-4 py-2 bg-green-600 text-white rounded">{loading ? "Salvando..." : "Salvar"}</button>
                </div>
            </form>
        </div>
    );
} 