import React from "react";
import { createEmployeePayment } from "@/app/api/employee/payments";
import { useSession } from "next-auth/react";
import { notifyError, notifySuccess } from "@/app/utils/notifications";
import { EmployeePayment, SchemaEmployeePayment } from "@/app/entities/employee/employee-payment";
import PriceField from "@/app/components/modal/fields/price";
import PatternField from "@/app/components/modal/fields/pattern";
import { ToIsoDate } from "@/app/utils/date";
import TextField from "@/app/components/modal/fields/text";
import SelectField from "@/app/components/modal/fields/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

interface PaymentModalProps {
    employeeId: string;
    onClose: () => void;
    onSuccess: (newPayment: any) => void;
}

export default function PaymentModal({ employeeId, onClose, onSuccess }: PaymentModalProps) {
    const { data: session } = useSession();

    const {
        handleSubmit,
        setValue,
        watch,
        formState: { isSubmitting, errors }
    } = useForm({
        resolver: zodResolver(SchemaEmployeePayment),
        defaultValues: {
            status: "Completed",
            method: "Cash",
            amount: 0,
            payment_date: "",
            notes: ""
        }
    });

    const form = watch();

    const onUpdate = async (formData: any) => {
        if (!session) return;

        try {
            const paymentData = { ...formData };
            if (paymentData.payment_date) {
                paymentData.payment_date = ToIsoDate(paymentData.payment_date);
            }

            const newPayment = await createEmployeePayment(employeeId, paymentData, session);
            notifySuccess("Pagamento lançado!");
            onSuccess(newPayment);
        } catch (err: any) {
            notifyError(err?.message || "Erro ao lançar pagamento");
        }
    };

    const onInvalid = () => {
        notifyError("Verifique os campos obrigatórios");
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <form onSubmit={handleSubmit(onUpdate, onInvalid)} className="bg-white p-6 rounded shadow-lg w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Novo Pagamento</h2>
                <PatternField
                    name="payment_date"
                    friendlyName="Data do Pagamento"
                    value={form.payment_date || ""}
                    setValue={value => setValue('payment_date', value)}
                    patternName="date"
                    formatted={true}
                    error={errors.payment_date?.message as string}
                />
                <PriceField
                    name="amount"
                    friendlyName="Valor"
                    placeholder="Valor"
                    value={form.amount || 0}
                    setValue={value => setValue('amount', value.toNumber())}
                    error={errors.amount?.message as string}
                />
                <SelectField
                    name="status"
                    friendlyName="Status"
                    selectedValue={form.status || "Completed"}
                    setSelectedValue={value => setValue('status', value)}
                    values={[
                        { id: "Completed", name: "Concluído" },
                        { id: "Pending", name: "Pendente" },
                        { id: "Cancelled", name: "Cancelado" },
                    ]}
                    error={errors.status?.message as string}
                />
                <SelectField
                    name="method"
                    friendlyName="Método"
                    selectedValue={form.method || "Cash"}
                    setSelectedValue={value => setValue('method', value)}
                    values={[
                        { id: "Cash", name: "Dinheiro" },
                        { id: "BankTransfer", name: "Transferência" },
                        { id: "Check", name: "Cheque" },
                        { id: "Other", name: "Outro" },
                    ]}
                    error={errors.method?.message as string}
                />
                <TextField
                    name="notes"
                    friendlyName="Observações"
                    placeholder="Observações" optional
                    value={form.notes || ""}
                    setValue={value => setValue('notes', value)}
                    error={errors.notes?.message as string}
                />
                <div className="flex justify-end gap-2 mt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Cancelar</button>
                    <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded">
                        {isSubmitting ? "Salvando..." : "Salvar"}
                    </button>
                </div>
            </form>
        </div>
    );
}
