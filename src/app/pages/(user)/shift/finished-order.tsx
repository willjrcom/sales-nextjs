import Decimal from 'decimal.js';
import Shift from "@/app/entities/shift/shift";
import { StatusOrder } from '@/app/entities/order/order';
import { useModal } from '@/app/context/modal/context';
import CardOrder from '@/app/components/card-order/card-order';
import { FaEye } from 'react-icons/fa';

interface ListOrderProps {
    shift: Shift;
    status?: StatusOrder;
    title: string;
}

const ListOrderCard = ({ shift, status, title }: ListOrderProps) => {
    const finishedOrders = shift?.orders?.filter(order => order.status === status);
    const modalHandler = useModal();

    const handleShowOrder = (orderId: string, orderNumber: number) => {
        modalHandler.showModal(
            `order-details-${orderId}`,
            `Detalhes do Pedido #${orderNumber}`,
            <CardOrder orderId={orderId} editBlocked={true} />,
            'xl'
        );
    };

    return (
        <div className="bg-white p-4 shadow-md rounded-lg">
            <h3 className="text-lg font-semibold mb-4">{title}</h3>
            <div className="max-h-64 overflow-y-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr>
                            <th className="pb-2">Comanda</th>
                            <th className="pb-2">Vendas (R$)</th>
                            <th className="pb-2 text-center">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {!finishedOrders?.length && (
                            <tr>
                                <td colSpan={3} className="py-2 text-center">Nenhum pedido encontrado</td>
                            </tr>
                        )}
                        {finishedOrders?.map((order, index) => (
                            <tr key={index} className="border-t">
                                <td className="py-2">{order.order_number}</td>
                                <td className="py-2">R$ {new Decimal(order.total_payable).toFixed(2)}</td>
                                <td className="py-2 text-center">
                                    <button
                                        onClick={() => handleShowOrder(order.id, order.order_number || 0)}
                                        className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full transition-colors"
                                        title="Ver detalhes"
                                    >
                                        <FaEye />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default ListOrderCard