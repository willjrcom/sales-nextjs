import CategoryOrder from "@/app/components/order/category/category"
import GroupItem from "@/app/entities/order/group-item"
import { useEffect, useState } from "react"
import EditGroupItem from "./group-item/edit-group-item"
import { useCurrentOrder } from "@/app/context/current-order/context"
import { useGroupItem } from "@/app/context/group-item/context"
import Order from "@/app/entities/order/order"
import { useSession } from "next-auth/react"
import PendingOrder from "@/app/api/order/status/pending/route"
import RequestError from "@/app/api/error"
import DeliveryCard from "./delivery-order"
import PickupCard from "./pickup-order"
import TableCard from "./table-order"
import StatusComponent from "../button/show-status"
import ButtonIconTextFloat from "../button/button-float"
import { useSelector } from "react-redux"
import { RootState } from "@/redux/store"

const OrderManager = () => {
    return (
        <div className="flex h-full bg-gray-100">
            <CartAdded />
            <OrderOptions />
        </div>
    )
};

const CartAdded = () => {
    const [groupedItems, setGroupedItems] = useState<Record<string, GroupItem[]>>({})
    const contextGroupItem = useGroupItem();
    const contextCurrentOrder = useCurrentOrder();
    const [order, setOrder] = useState<Order | null>(contextCurrentOrder.order);
    const categoriesSlice = useSelector((state: RootState) => state.categories);

    useEffect(() => {
        setOrder(contextCurrentOrder.order)
    }, [contextCurrentOrder.order])

    useEffect(() => {
        if (!order) return
        const items = groupBy(order.groups, "category_id");
        setGroupedItems(items);
    }, [order?.groups]);

    if (!order) return null
    return (
        <div className="bg-white w-full">
            <div className=" mb-2">
                <h1 className="text-xl font-bold mb-1">Meus Itens</h1>
                <div onClick={() => contextGroupItem.resetGroupItem()}>
                    <ButtonIconTextFloat size="xl"
                        position="bottom-right"
                        title="Novo grupo de itens" 
                        modalName="edit-group-item" 
                        onCloseModal={() => contextCurrentOrder.fetchData(order.id)}>
                        <EditGroupItem />
                    </ButtonIconTextFloat>
                </div>
            </div>

            <div className="overflow-y-auto overflow-x-auto h-[76vh]">
                {Object.entries(groupedItems).map(([key, groups], index) => {
                    if (Object.values(categoriesSlice.entities).length === 0) return
                    const category = categoriesSlice.entities[key]
                    if (!category) return
                    return (
                        <CategoryOrder key={key} category={category} groups={groups} />
                    )
                })}
            </div>
        </div>
    )
}

const OrderOptions = () => {
    const contextCurrentOrder = useCurrentOrder();
    const [order, setOrder] = useState<Order | null>(contextCurrentOrder.order);

    useEffect(() => {
        setOrder(contextCurrentOrder.order)
    }, [contextCurrentOrder.order])

    return (
        <div className="w-80 bg-gray-50 p-3 overflow-y-auto">
            {/* Lançar Pedido */}

            <DataOrderCard />
            {order?.delivery && <DeliveryCard />}
            {order?.pickup && <PickupCard />}
            {order?.table && <TableCard />}
        </div>
    );
};

const DataOrderCard = () => {
    const { data } = useSession();
    const contextCurrentOrder = useCurrentOrder();
    const [error, setError] = useState<RequestError | null>(null)
    const [order, setOrder] = useState<Order | null>(contextCurrentOrder.order);

    useEffect(() => {
        setOrder(contextCurrentOrder.order)
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

    const isStatusStagingOrPendingOrReady = order?.status == "Staging" || order?.status == "Pending" || order?.status == "Ready"
    const haveGroups = order && order?.groups?.length > 0
    const isAnyGroupsStaging = haveGroups && order?.groups?.some((group) => group.status == "Staging")
    const isThrowButton = isStatusStagingOrPendingOrReady && isAnyGroupsStaging
    const subTotal = (order?.total_payable || 0) - (order?.delivery?.delivery_tax || 0)

    return (
        <div className="bg-white p-4 rounded-lg shadow-md mb-4">
            <h3 className="text-lg font-semibold mb-2">Comanda N° {order?.order_number}</h3>
            {order?.status && <p><StatusComponent status={order?.status} /></p>}
            {error && <p className="mb-4 text-red-500">{error.message}</p>}
            <br />
            {/* Total do pedido */}
            <p><strong>Subtotal:</strong> R$ {subTotal.toFixed(2)}</p>
            {order?.delivery?.delivery_tax && <p><strong>Taxa de entrega:</strong> R$ {order.delivery.delivery_tax.toFixed(2)}</p>}

            {/* <p>Desconto: R$ 5,00</p> */}
            <hr className="my-2" />
            <p><strong>Total:</strong> R$ {(order?.total_payable || 0).toFixed(2)}</p>
            <br />
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