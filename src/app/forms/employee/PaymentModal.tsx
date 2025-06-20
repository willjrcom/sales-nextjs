import React, { useState } from "react";
import { createEmployeePayment } from "@/app/api/employee/payments";
import { useSession } from "next-auth/react";
import { notifyError, notifySuccess } from "@/app/utils/notifications";
import { EmployeePayment } from "@/app/entities/employee/employee-payment";
import PriceField from "@/app/components/modal/fields/price";

interface PaymentModalProps {
    employeeId: string;
    onClose: () => void;
    onSuccess: (newPayment: any) => void;
}

export default function PaymentModal({ employeeId, onClose, onSuccess }: PaymentModalProps) {
    const { data } = useSession();
    const [form, setForm] = useState<EmployeePayment>({status: "Completed", method: "Cash"} as EmployeePayment);
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!data) return;
        setLoading(true);

        try {
            const newPayment = await createEmployeePayment(employeeId, form, data);
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
                <input name="paymentDate" type="date" value={form.payment_date} onChange={handleChange} required className="mb-2 w-full border px-2 py-1 rounded" />
                <PriceField name="amount" placeholder="Valor" value={form.amount || 0} setValue={(value) => setForm({ ...form, amount: value })} />
                <select name="status" value={form.status} onChange={handleChange} className="mb-2 w-full border px-2 py-1 rounded">
                    <option value="Completed">Concluído</option>
                    <option value="Pending">Pendente</option>
                    <option value="Cancelled">Cancelado</option>
                </select>
                <select name="method" value={form.method} onChange={handleChange} className="mb-2 w-full border px-2 py-1 rounded">
                    <option value="Cash">Dinheiro</option>
                    <option value="BankTransfer">Transferência</option>
                    <option value="Check">Cheque</option>
                    <option value="Other">Outro</option>
                </select>
                <input name="notes" placeholder="Observações" value={form.notes} onChange={handleChange} className="mb-2 w-full border px-2 py-1 rounded" />
                <div className="flex justify-end gap-2 mt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Cancelar</button>
                    <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">{loading ? "Salvando..." : "Salvar"}</button>
                </div>
            </form>
        </div>
    );
} 