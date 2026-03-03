import React from "react";
import { createEmployeeSalaryHistory } from "@/app/api/employee/salary-history";
import { useSession } from "next-auth/react";
import { notifyError, notifySuccess } from "@/app/utils/notifications";
import { EmployeeSalaryHistory, SchemaEmployeeSalaryHistory } from "@/app/entities/employee/employee-payment";
import PriceField from "@/app/components/modal/fields/price";
import PatternField from "@/app/components/modal/fields/pattern";
import { ToIsoDate } from "@/app/utils/date";
import SelectField from "@/app/components/modal/fields/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Decimal from "decimal.js";

interface SalaryHistoryModalProps {
    employeeId: string;
    onClose: () => void;
    onSuccess: (newHistory: any) => void;
}

export default function SalaryHistoryModal({ employeeId, onClose, onSuccess }: SalaryHistoryModalProps) {
    const { data: session } = useSession();

    const {
        handleSubmit,
        setValue,
        watch,
        formState: { isSubmitting, errors }
    } = useForm({
        resolver: zodResolver(SchemaEmployeeSalaryHistory),
        defaultValues: {
            salary_type: "Fixo",
            base_salary: 0,
            hourly_rate: 0,
            commission: 0,
            start_date: ""
        }
    });

    const form = watch();

    const onUpdate = async (formData: any) => {
        if (!session) return;
        try {
            const payload = { ...formData };

            // Converte a data para formato ISO se fornecida
            if (payload.start_date) {
                payload.start_date = ToIsoDate(payload.start_date);
            }

            const newHistory = await createEmployeeSalaryHistory(employeeId, payload, session);
            notifySuccess("Histórico salarial lançado!");
            onSuccess(newHistory);
        } catch (err: any) {
            console.error('Erro detalhado:', err);
            notifyError(err?.message || "Erro ao lançar histórico salarial");
        }
    };

    const onInvalid = () => {
        console.log(errors);
        notifyError("Verifique os campos obrigatórios");
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <form onSubmit={handleSubmit(onUpdate, onInvalid)} className="bg-white p-6 rounded shadow-lg w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Alterar Salário</h2>
                <PatternField
                    name="start_date"
                    friendlyName="Início"
                    value={form.start_date || ""}
                    setValue={value => setValue('start_date', value)}
                    patternName="date"
                    formatted={true}
                    error={errors.start_date?.message as string}
                />
                <SelectField
                    name="salary_type"
                    friendlyName="Tipo"
                    selectedValue={form.salary_type}
                    setSelectedValue={value => setValue('salary_type', value)}
                    values={[
                        { id: "Fixo", name: "Salário Fixo" },
                        { id: "Variavel", name: "Salário Variável" },
                        { id: "F + V", name: "Salário Fixo + Variável" },
                    ]}
                    error={errors.salary_type?.message as string}
                />
                <PriceField
                    name="base_salary"
                    friendlyName="Base salarial"
                    placeholder="Salário Base"
                    value={form.base_salary || 0}
                    setValue={value => setValue('base_salary', value.toNumber())}
                    error={errors.base_salary?.message as string}
                />
                <PriceField
                    name="hourly_rate"
                    friendlyName="Valor por hora adicional"
                    placeholder="Valor Hora"
                    value={form.hourly_rate || 0}
                    setValue={value => setValue('hourly_rate', value.toNumber())}
                    error={errors.hourly_rate?.message as string}
                />
                <div className="flex justify-end gap-2 mt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Cancelar</button>
                    <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-green-600 text-white rounded">
                        {isSubmitting ? "Salvando..." : "Salvar"}
                    </button>
                </div>
            </form>
        </div>
    );
}
