import ButtonPlus from "@/app/components/crud/button-plus"
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
import ButtonEdit from "../crud/button-edit"
import ClientAddressForm from "@/app/forms/client/update-address-order"

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

            <Cart order={order} />
            <ConfirmOrder order={order}/>
        </div>
    )
};

interface CartProps {
    order: Order | null;
}

const Cart = ({ order }: CartProps) => {
    const [groupedItems, setGroupedItems] = useState<Record<string, GroupItem[]>>({})
    const contextCategories = useCategories();
    const contextGroupItem = useGroupItem();

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
                <ButtonPlus size="xl" name="item" modalName="edit-group-item">
                    <EditGroupItem />
                </ButtonPlus>
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
    const { data } = useSession();
    const [error, setError] = useState<RequestError | null>(null)

    const onSubmit = async () => {
        if (!order || !data) return

        try {
            await PendingOrder(order, data)
            setError(null)
        } catch(error) {
            setError(error as RequestError)
        }
    }
    return (
        <div className="w-80 bg-gray-50 p-4 overflow-y-auto">
            {/* Lançar Pedido */}
            <div className="bg-yellow-100 p-4 rounded-lg mb-4">
                {error && <p className="mb-4 text-red-500">{error.message}</p>}
                {order?.status == "Staging" && <button className="w-full bg-yellow-500 text-white py-2 rounded-lg mb-4" onClick={onSubmit}>
                    Lançar Pedido
                </button>}
                <p>Subtotal: R$ {order?.total_payable}</p>
                {order?.delivery?.delivery_tax && <p>Taxa de entrega: R$ {order.delivery.delivery_tax}</p>}
                {/* <p>Desconto: R$ 5,00</p> */}
                <hr className="my-2" />
                <p className="font-bold">Total: R$ {(order?.total_payable || 0) + (order?.delivery?.delivery_tax || 0)}</p>
            </div>

            {order?.delivery && <DeliveryCard order={order} />}
        </div>
    );
};

interface DeliveryCardProps {
    order: Order | null
}

const DeliveryCard = ({ order }: DeliveryCardProps) => {
    const client = order?.delivery?.client;
    console.log(client)
    const address = client?.address;
    return (
        <div className="bg-white p-4 rounded-lg shadow-md">
                <div className="flex justify-between items-center">
                    <h2 className="font-bold mb-2">Entrega</h2>
                    <ButtonEdit modalName={"edit-client-" + order?.delivery?.client_id} name="Cliente" size="md">
                        <ClientAddressForm item={order?.delivery?.client} deliveryOrderId={order?.delivery?.id}/>
                    </ButtonEdit>
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