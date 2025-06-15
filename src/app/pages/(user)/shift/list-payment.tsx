"use client";

import Decimal from "decimal.js";
import Shift from "@/app/entities/shift/shift";

interface ListPaymentProps {
  shift: Shift;
}

const ListPayment = ({ shift }: ListPaymentProps) => {
  const payments = shift.payments || [];
  return (
    <div className="bg-white p-4 shadow-md rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Pagamentos</h3>
      <div className="max-h-64 overflow-y-auto">
        <table className="w-full text-left">
          <thead>
            <tr>
              <th className="pb-2">Método</th>
              <th className="pb-2">Valor Pago (R$)</th>
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 && (
              <tr>
                <td colSpan={2} className="py-2 text-center">Nenhum pagamento encontrado</td>
              </tr>
            )}
            {payments.map((payment, index) => (
              <tr key={payment.id || index} className="border-t">
                <td className="py-2">{payment.method}</td>
                <td className="py-2">R$ {new Decimal(payment.total_paid).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ListPayment;