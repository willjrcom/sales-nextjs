import ButtonIconText from "@/app/components/crud/button-icon-text"
import CategoryOrder from "@/app/components/order/category/category"
import { useCategories } from "@/app/context/category/context"
import GroupItem from "@/app/entities/order/group-item"
import { useEffect, useState } from "react"
import EditGroupItem from "./group-item/edit-group-item"
import { useCurrentOrder } from "@/app/context/current-order/context"
import { useGroupItem } from "@/app/context/group-item/context"
import Order from "@/app/entities/order/order"
import GetOrderByID from "@/app/api/order/[id]/route"
import { useSession } from "next-auth/react"
import PendingOrder from "@/app/api/order/status/pending/route"
import RequestError from "@/app/api/error"
import ButtonIcon from "../crud/button-icon"
import ClientAddressForm from "@/app/forms/client/update-address-order"
import { showStatus } from "@/app/utils/status"

const OrderManager = () => {
    const context = useCurrentOrder();
    const [order, setOrder] = useState<Order | null>(context.order);
    const { data } = useSession();

    useEffect(() => {
        fetchOrder()
    }, [context.order])

    const fetchOrder = async () => {
        if (!context.order || !data) return
        const orderUpdated = await GetOrderByID(context.order.id, data);
        setOrder(orderUpdated);
    }

    return (
        <div className="flex h-[80vh] bg-gray-100">

            <CartAdded order={order} />
            <ConfirmOrder order={order} />
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
        <div className="flex-1 p-4 bg-white overflow-y-auto">
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
                    <CategoryOrder key={index} category={category} groups={groups} />
                )
            })}
        </div>
    )
}

interface OrderManagerProps {
    order: Order | null;
}

const ConfirmOrder = ({ order }: OrderManagerProps) => {
    return (
        <div className="w-80 bg-gray-50 p-4 overflow-y-auto">
            {/* Lançar Pedido */}

            <DataOrderCard order={order} />
            {order?.delivery && <DeliveryCard order={order} />}
        </div>
    );
};

interface DataOrderCardProps {
    order: Order | null;
}

const DataOrderCard = ({ order }: DataOrderCardProps) => {
    const { data } = useSession();
    const [error, setError] = useState<RequestError | null>(null)

    const onSubmit = async () => {
        if (!order || !data) return

        try {
            await PendingOrder(order, data)
            setError(null)
        } catch (error) {
            setError(error as RequestError)
        }
    }

    return (
        <div className="bg-white p-4 rounded-lg shadow-md mb-4">
            <h3 className="text-lg font-semibold mb-2">Comanda N° {order?.order_number}</h3>
            {order?.status && <p><strong>Status:</strong> {showStatus(order?.status)}</p>}
            {error && <p className="mb-4 text-red-500">{error.message}</p>}
            {order?.status == "Staging" && <button className="w-full bg-yellow-500 text-white py-2 rounded-lg mb-4" onClick={onSubmit}>
                Lançar Pedido
            </button>}
            <p><strong>Subtotal:</strong> R$ {order?.total_payable.toFixed(2)}</p>
            {order?.delivery?.delivery_tax && <p><strong>Taxa de entrega:</strong> R$ {order.delivery.delivery_tax.toFixed(2)}</p>}
            {/* <p>Desconto: R$ 5,00</p> */}
            <hr className="my-2" />
            <p><strong>Total:</strong> R$ {((order?.total_payable || 0) + (order?.delivery?.delivery_tax || 0)).toFixed(2)}</p>
        </div>
    )
}
interface DeliveryCardProps {
    order: Order | null
}

const DeliveryCard = ({ order }: DeliveryCardProps) => {
    const client = order?.delivery?.client;
    const address = client?.address;
    return (
        <div className="bg-white p-4 rounded-lg shadow-md mb-4">
            <div className="flex justify-between items-center">
                <h2 className="font-bold mb-2">Entrega</h2>
                <ButtonIcon modalName={"edit-client-" + order?.delivery?.client_id} title="Editar cliente" size="md">
                    <ClientAddressForm item={order?.delivery?.client} deliveryOrderId={order?.delivery?.id} />
                </ButtonIcon>
            </div>

            <p>{client?.name}</p>
            <p>Endereço: {address?.street}, {address?.number}</p>
            <p>Bairro: {address?.neighborhood}</p>
            <p>Cidade: {address?.city}</p>
            <p>Cep: {address?.cep}</p>
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