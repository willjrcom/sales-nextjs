import ButtonPlus from "@/app/components/crud/button-plus"
import CategoryOrder from "@/app/components/order/category"
import { useCategories } from "@/app/context/category/context"
import GroupItem from "@/app/entities/order/group-item"
import { useEffect, useState } from "react"
import EditGroupItem from "./edit-group-item"
import { useCurrentOrder } from "@/app/context/current-order/context"
import { useGroupItem } from "@/app/context/group-item/context"
import Order from "@/app/entities/order/order"

const OrderManager = () => {
    const [groupedItems, setGroupedItems] = useState<Record<string, GroupItem[]>>({})
    const contextCategories = useCategories();
    const context = useCurrentOrder();
    const contextGroupItem = useGroupItem();
    const [order, setOrder] = useState<Order | null>(context.order)

    useEffect(() => {
        if (!context.order) return
        const items = groupBy(context.order.groups, "category_id");
        setGroupedItems(items);
    }, [context.order, contextGroupItem.groupItem]);

    useEffect(() => {
        if (!context.order) return
        const newOrder = context.order;
        newOrder.total_payable = newOrder?.groups?.reduce((total, group) => total + (group.total_price || 0), 0);
        setOrder(newOrder)
        console.log(newOrder)
    }, [context.order])

    return (
        <div className="flex h-[80vh] bg-gray-100">
            {/* Lado Esquerdo */}
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

            {/* Lado Direito */}
            <ConfirmOrder order={order}/>
        </div>
    )
};

interface OrderManagerProps {
    order: Order | null;
}

const ConfirmOrder = ({ order }: OrderManagerProps) => {
    return (
        <div className="w-80 bg-gray-50 p-4 overflow-y-auto">
            {/* Fechar Pedido */}
            <div className="bg-yellow-100 p-4 rounded-lg mb-4">
                <button className="w-full bg-yellow-500 text-white py-2 rounded-lg mb-4">
                    Fechar Pedido
                </button>
                <p>Subtotal: R$ {order?.total_payable}</p>
                {order?.delivery?.delivery_tax && <p>Taxa de entrega: R$ {order.delivery.delivery_tax}</p>}
                {/* <p>Desconto: R$ 5,00</p> */}
                <hr className="my-2" />
                <p className="font-bold">Total: R$ {(order?.total_payable || 0) + (order?.delivery?.delivery_tax || 0)}</p>
            </div>

            {/* Entrega */}
            <div className="bg-white p-4 rounded-lg shadow-md">
                <h2 className="font-bold mb-2">Entrega</h2>
                <p>William A. G. Junior</p>
                <p>Endereço: Rua Piedade 226, Jardim Leocadia</p>
                <button className="mt-4 w-full bg-blue-500 text-white py-2 rounded-lg">
                    Alterar Endereço
                </button>
            </div>
        </div>
    );
};

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