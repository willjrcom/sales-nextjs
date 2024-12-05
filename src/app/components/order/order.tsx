import ButtonIconText from "@/app/components/button/button-icon-text"
import CategoryOrder from "@/app/components/order/category/category"
import { useCategories } from "@/app/context/category/context"
import GroupItem from "@/app/entities/order/group-item"
import { useCallback, useEffect, useState } from "react"
import EditGroupItem from "./group-item/edit-group-item"
import { useCurrentOrder } from "@/app/context/current-order/context"
import { useGroupItem } from "@/app/context/group-item/context"
import Order from "@/app/entities/order/order"
import GetOrderByID from "@/app/api/order/[id]/route"
import { useSession } from "next-auth/react"
import PendingOrder from "@/app/api/order/status/pending/route"
import RequestError from "@/app/api/error"
import DeliveryCard from "./delivery-order"
import PickupCard from "./pickup-order"
import TableCard from "./table-order"
import StatusComponent from "../button/show-status"

const OrderManager = () => {
    const context = useCurrentOrder();
    const [order, setOrder] = useState<Order | null>(context.order);
    const { data } = useSession();

    const fetchOrder = useCallback(async () => {
        if (!context.order || !data) return
        const orderUpdated = await GetOrderByID(context.order.id, data);
        setOrder(orderUpdated);
    }, [context.order, data]);

    useEffect(() => {
        fetchOrder()
    }, [context.order, fetchOrder])

    return (
        <div className="flex h-[80vh] bg-gray-100">
            <CartAdded order={order} />
            <OrderOptions order={order} />
        </div>
    )
};

interface CartProps {
    order: Order | null;
}

const CartAdded = ({ order }: CartProps) => {
    const [groupedItems, setGroupedItems] = useState<Record<string, GroupItem[]>>({})
    const contextCategories = useCategories();
    const contextGroupItem = useGroupItem();
    const contextCurrentOrder = useCurrentOrder();

    useEffect(() => {
        if (!order) return
        const items = groupBy(order.groups, "category_id");
        setGroupedItems(items);
    }, [order]);

    return (
        <div className="flex-1 p-4 bg-white overflow-y-auto overflow-x-auto">
            <div className="flex justify-between items-center mb-2">
                <h1 className="text-xl font-bold mb-4">Meus Itens</h1>
                <div onClick={() => contextGroupItem.resetGroupItem()}>
                    <ButtonIconText size="xl" title="Novo grupo de itens" modalName="edit-group-item" onCloseModal={contextCurrentOrder.fetchData}>
                        <EditGroupItem />
                    </ButtonIconText>
                </div>
            </div>

            {Object.entries(groupedItems).map(([key, groups], index) => {
                if (contextCategories.items.length === 0) return
                const category = contextCategories.findByID(key)
                if (!category) return
                return (
                    <CategoryOrder key={key} category={category} groups={groups} />
                )
            })}
        </div>
    )
}

const OrderOptions = ({ order }: CartProps) => {
    return (
        <div className="w-80 bg-gray-50 p-4 overflow-y-auto">
            {/* Lançar Pedido */}

            <DataOrderCard order={order} />
            {order?.delivery && <DeliveryCard order={order} />}
            {order?.pickup && <PickupCard order={order} />}
            {order?.table && <TableCard order={order} />}
        </div>
    );
};

const DataOrderCard = ({ order }: CartProps) => {
    const { data } = useSession();
    const [error, setError] = useState<RequestError | null>(null)
    const contextCurrentOrder = useCurrentOrder();

    const onSubmit = async () => {
        if (!order || !data) return

        try {
            await PendingOrder(order, data)
            setError(null)
            contextCurrentOrder.fetchData();
        } catch (error) {
            setError(error as RequestError)
        }
    }

    const isStatusStagingOrPending = order?.status == "Staging" || order?.status == "Pending"
    const haveGroups = order && order?.groups?.length > 0
    const isAnyGroupsStaging = haveGroups && order?.groups?.some((group) => group.status == "Staging")
    const isThrowButton = isStatusStagingOrPending && isAnyGroupsStaging

    return (
        <div className="bg-white p-4 rounded-lg shadow-md mb-4">
            <h3 className="text-lg font-semibold mb-2">Comanda N° {order?.order_number}</h3>
            {order?.status && <p><StatusComponent status={order?.status} /></p>}
            {error && <p className="mb-4 text-red-500">{error.message}</p>}
            <br/>
            {/* Total do pedido */}
            <p><strong>Subtotal:</strong> R$ {order?.total_payable.toFixed(2)}</p>
            {order?.delivery?.delivery_tax && <p><strong>Taxa de entrega:</strong> R$ {order.delivery.delivery_tax.toFixed(2)}</p>}
            {/* <p>Desconto: R$ 5,00</p> */}
            <hr className="my-2" />
            <p><strong>Total:</strong> R$ {((order?.total_payable || 0) + (order?.delivery?.delivery_tax || 0)).toFixed(2)}</p>
            <br/>
            {isThrowButton && <button className="w-full bg-yellow-500 text-white py-2 rounded-lg mb-4" onClick={onSubmit}>
                Lançar Pedido
            </button>}
        </div>
    )
}



function groupBy<T extends Record<string, any>>(array: T[], key: keyof T): Record<string, T[]> {
    if (!array || array.length === 0) {
        return {};
    }
    return array?.reduce((result, currentItem) => {
        const groupKey = currentItem[key] as string;

        if (!result[groupKey]) {
            result[groupKey] = [];
        }
        result[groupKey].push(currentItem);
        return result;
    }, {} as Record<string, T[]>);
}

export default OrderManager