import Decimal from 'decimal.js';
import Shift from "@/app/entities/shift/shift";

interface FinishedOrderProps {
    shift: Shift;
}

const FinishedOrderCard = ({ shift }: FinishedOrderProps) => {
    const finishedOrders = shift?.orders?.filter(order => order.status === 'Finished');

    return (
        <div className="bg-white p-4 shadow-md rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Pedidos Finalizados</h3>
            <div className="max-h-64 overflow-y-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr>
                            <th className="pb-2">Comanda</th>
                            <th className="pb-2">Vendas (R$)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {!finishedOrders?.length && (
                            <tr>
                                <td colSpan={2} className="py-2 text-center">Nenhum pedido encontrado</td>
                            </tr>
                        )}
                        {finishedOrders?.map((order, index) => (
                            <tr key={index} className="border-t">
                                <td className="py-2">{order.order_number}</td>
                                <td className="py-2">R$ {new Decimal(order.total_payable).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default FinishedOrderCard