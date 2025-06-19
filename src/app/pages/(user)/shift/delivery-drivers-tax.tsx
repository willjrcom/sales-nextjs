"use client";

import Shift from "@/app/entities/shift/shift";
import Decimal from "decimal.js";
import OrderDelivery from "@/app/entities/order/order-delivery";

interface DeliveryDriversTaxProps {
  shift: Shift;
}

const ListDeliveryDriversTax = ({ shift }: DeliveryDriversTaxProps) => {
  const orders = shift.orders || [];
  // Filtrar apenas pedidos com delivery e motorista atribuído
  const deliveries = orders
    .filter(o => o.delivery && o.delivery.driver_id)
    // assumir delivery não nulo
    .map(o => ({ orderNumber: o.order_number, delivery: o.delivery as OrderDelivery }));

  // Agrupar por motorista
  const groups: Record<string, { driverName: string; totalTax: Decimal; deliveries: { orderNumber: number; deliveryTax: Decimal }[] }> = {};
  deliveries.forEach(({ orderNumber, delivery }) => {
    const driver = delivery.driver!;
    const driverId = driver.id;
    const driverName = driver.employee?.name || "";
    const tax = new Decimal(delivery.delivery_tax || "0");
    if (!groups[driverId]) {
      groups[driverId] = { driverName, totalTax: new Decimal(0), deliveries: [] };
    }
    groups[driverId].totalTax = groups[driverId].totalTax.plus(tax);
    groups[driverId].deliveries.push({ orderNumber, deliveryTax: tax });
  });

  const groupEntries = Object.entries(groups);

  return (
    <div className="bg-white p-4 shadow-md rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Taxa de Entrega por Motoboy</h3>
      {groupEntries.length === 0 && (
        <p className="text-sm text-gray-500">Nenhuma taxa de entrega encontrada.</p>
      )}
      {groupEntries.map(([driverId, data]) => (
        <div key={driverId} className="mb-6">
          <h4 className="text-md font-semibold">{data.driverName}</h4>
          <p className="text-sm mb-2">
            Total de Entregas: {data.deliveries.length} &nbsp;|&nbsp; Taxa Total: R$ {data.totalTax.toFixed(2)}
          </p>
          <table className="w-full text-left mb-4">
            <thead>
              <tr>
                <th className="px-4 py-2">Comanda</th>
                <th className="px-4 py-2">Taxa (R$)</th>
              </tr>
            </thead>
            <tbody>
              {data.deliveries.map((d, idx) => (
                <tr key={idx} className="border-t">
                  <td className="px-4 py-2">{d.orderNumber}</td>
                  <td className="px-4 py-2">R$ {d.deliveryTax.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};
// fim ListDeliveryDriversTax

export default ListDeliveryDriversTax