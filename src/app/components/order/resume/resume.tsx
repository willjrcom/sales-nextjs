"use client";
import { useEffect, useState } from "react"
import { useCurrentOrder } from "@/app/context/current-order/context"
import Order from "@/app/entities/order/order"
import { useSession } from "next-auth/react"
import PendingOrder from "@/app/api/order/status/pending/order"
import RequestError from "@/app/utils/error"
import StatusComponent from "../../button/show-status"
import DeliveryCard from "../type/delivery-order"
import PickupCard from "../type/pickup-order"
import TableCard from "../type/table-order"
import PriceField from "../../modal/fields/price"
import UpdateChangeOrderDelivery from "@/app/api/order-delivery/update/change/order-delivery"
import { SelectField } from "../../modal/field"
import { payMethodsWithId } from "@/app/entities/order/order-payment"
import Decimal from 'decimal.js';

export const CardOrderResume = () => {
    const contextCurrentOrder = useCurrentOrder();
    const [order, setOrder] = useState<Order | null>(contextCurrentOrder.order);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        setOrder(contextCurrentOrder.order)
    }, [contextCurrentOrder.order])

    return (
        <>
            <button
                type="button"
                onClick={() => setIsOpen(prev => !prev)}
                className={`fixed top-1/2 transform -translate-y-1/2 z-50 [writing-mode:vertical-rl] rotate-180 cursor-pointer focus:outline-none bg-green-500 text-white p-2 rounded-r-md transition-all duration-300 ${isOpen ? 'right-[30vw]' : 'right-0'}`}
            >
                Resumo
            </button>

            <div className="fixed right-0 top-0 h-full z-40">
                <div className={`h-full bg-gray-200 text-white overflow-hidden flex flex-col transition-all duration-300 ease-in-out ${isOpen ? 'w-[30vw]' : 'w-0'} origin-right`}>
                    {isOpen && (
                        <div className="p-4 text-black">
                            <h2 className="text-lg font-bold text-black">Resumo</h2>
                            <OrderPaymentsResume />
                            {order?.delivery && <DeliveryCard />}
                            {order?.pickup && <PickupCard />}
                            {order?.table && <TableCard />}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export const OrderPaymentsResume = () => {
    const { data } = useSession();
    const contextCurrentOrder = useCurrentOrder();
    const [error, setError] = useState<RequestError | null>(null)
    const [order, setOrder] = useState<Order | null>(contextCurrentOrder.order);
    const [change, setChange] = useState<Decimal>(new Decimal(order?.delivery?.change || 0));
    const [paymentMethod, setPaymentMethod] = useState<string>(order?.delivery?.payment_method || "");

    useEffect(() => {
        setOrder(contextCurrentOrder.order)
        setChange(new Decimal(contextCurrentOrder.order?.delivery?.change || 0))
        setPaymentMethod(contextCurrentOrder.order?.delivery?.payment_method || "")
    }, [contextCurrentOrder.order])

    const onSubmit = async () => {
        if (!order || !data) return

        try {
            await PendingOrder(order.id, data)
            setError(null)
            contextCurrentOrder.fetchData(order.id);
        } catch (error) {
            setError(error as RequestError)
        }
    }

    const updateChange = async () => {
        if (!order || !order.delivery || !data) return

        try {
            await UpdateChangeOrderDelivery(order.delivery.id, change.toNumber(), paymentMethod, data)
            setError(null)
            contextCurrentOrder.fetchData(order.id);
        } catch (error) {
            setError(error as RequestError)
        }
    }

    const isStatusStagingOrPendingOrReady = order?.status == "Staging" || order?.status == "Pending" || order?.status == "Ready"
    const haveGroups = order && order?.group_items?.length > 0
    const isAnyGroupsStaging = haveGroups && order?.group_items?.some((group) => group.status == "Staging")
    const isThrowButton = isStatusStagingOrPendingOrReady && isAnyGroupsStaging;
    const totalPayableDecimal = new Decimal(order?.total_payable || "0");
    const deliveryTaxDecimal = new Decimal((order?.delivery?.delivery_tax || "0"))
    const subTotalDecimal = totalPayableDecimal.minus(deliveryTaxDecimal);

    return (
        <div className="bg-white p-4 rounded-lg shadow-md mb-4">
            <h3 className="text-lg font-semibold mb-2">Comanda N° {order?.order_number}</h3>
            {order?.status && <p><StatusComponent status={order?.status} /></p>}
            {error && <p className="mb-4 text-red-500">{error.message}</p>}
            <br />
            {/* Total do pedido */}
            {order?.delivery &&
                <div>
                    <hr className="my-2" />
                    <PriceField friendlyName="Troco" name="change" value={change} setValue={setChange} optional />
                    <SelectField friendlyName="Forma de pagamento" name="payment_method" values={payMethodsWithId} selectedValue={paymentMethod} setSelectedValue={setPaymentMethod} optional />

                    {(change !== order.delivery.change || paymentMethod !== order.delivery.payment_method) &&
                        <button className="ml-4 text-red-500" onClick={updateChange}>Alterar troco</button>
                    }
                </div>
            }

            <hr className="my-2" />
            <p><strong>Subtotal:</strong> R$ {subTotalDecimal.toFixed(2)}</p>
            {order?.delivery?.delivery_tax && <p><strong>Taxa de entrega:</strong> R$ {deliveryTaxDecimal.toFixed(2)}</p>}

            {/* <p>Desconto: R$ 5,00</p> */}
            <hr className="my-2" />
            <p><strong>Total:</strong> R$ {totalPayableDecimal.toFixed(2)}</p>
            <br />

            {/* Lançar Pedido */}
            {isThrowButton && <button className="w-full bg-yellow-500 text-white py-2 rounded-lg mb-4" onClick={onSubmit}>
                Lançar Pedido
            </button>}
        </div>
    )
}
