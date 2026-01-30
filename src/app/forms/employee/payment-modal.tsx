import React, { useState } from "react";
import { createEmployeePayment } from "@/app/api/employee/payments";
import { useSession } from "next-auth/react";
import { notifyError, notifySuccess } from "@/app/utils/notifications";
import { EmployeePayment } from "@/app/entities/employee/employee-payment";
import PriceField from "@/app/components/modal/fields/price";
import PatternField from "@/app/components/modal/fields/pattern";
import { ToIsoDate, ToUtcDate } from "@/app/utils/date";
import TextField from "@/app/components/modal/fields/text";
import SelectField from "@/app/components/modal/fields/select";

interface PaymentModalProps {
    employeeId: string;
    onClose: () => void;
    onSuccess: (newPayment: any) => void;
}

export default function PaymentModal({ employeeId, onClose, onSuccess }: PaymentModalProps) {
    const { data } = useSession();
    const [form, setForm] = useState<EmployeePayment>({ status: "Completed", method: "Cash" } as EmployeePayment);
    const [loading, setLoading] = useState(false);

    const handleInputChange = (field: keyof EmployeePayment, value: any) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!data) return;
        setLoading(true);

        try {
            // Converte a data para formato ISO se fornecida
            const paymentData = { ...form };
            if (paymentData.payment_date) {
                paymentData.payment_date = ToIsoDate(paymentData.payment_date);
            }

            const newPayment = await createEmployeePayment(employeeId, paymentData, data);
            notifySuccess("Pagamento lançado!");
            onSuccess(newPayment);
        } catch (err: any) {
            notifyError(err?.message || "Erro ao lançar pagamento");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-lg w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Novo Pagamento</h2>
                <PatternField
                    name="payment_date"
                    friendlyName="Data do Pagamento"
                    value={form.payment_date || ""}
                    setValue={value => handleInputChange('payment_date', value)}
                    patternName="date"
                    formatted={true}
                />
                <PriceField
                    name="amount"
                    friendlyName="Valor"
                    placeholder="Valor"
                    value={form.amount || 0}
                    setValue={value => handleInputChange('amount', value)}
                />
                <SelectField
                    name="status"
                    friendlyName="Status"
                    selectedValue={form.status || "Completed"}
                    setSelectedValue={value => handleInputChange('status', value)}
                    values={[
                        { id: "Completed", name: "Concluído" },
                        { id: "Pending", name: "Pendente" },
                        { id: "Cancelled", name: "Cancelado" },
                    ]}
                />
                <SelectField
                    name="method"
                    friendlyName="Método"
                    selectedValue={form.method || "Cash"}
                    setSelectedValue={value => handleInputChange('method', value)}
                    values={[
                        { id: "Cash", name: "Dinheiro" },
                        { id: "BankTransfer", name: "Transferência" },
                        { id: "Check", name: "Cheque" },
                        { id: "Other", name: "Outro" },
                    ]}
                />
                <TextField
                    name="notes"
                    friendlyName="Observações"
                    placeholder="Observações"
                    value={form.notes || ""}
                    setValue={value => handleInputChange('notes', value)}
                />
                <div className="flex justify-end gap-2 mt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Cancelar</button>
                    <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">{loading ? "Salvando..." : "Salvar"}</button>
                </div>
            </form>
        </div>
    );
} 