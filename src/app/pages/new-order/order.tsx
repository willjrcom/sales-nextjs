import ButtonPlus from "@/app/components/crud/button-plus"
import CategoryOrder from "@/app/components/order/category"
import { useCategories } from "@/app/context/category/context"
import { GroupItem } from "@/app/entities/order/group-item"
import Order from "@/app/entities/order/order"
import { useEffect, useState } from "react"
import PageListProducts from "./list-products"
import ButtonNewItem from "@/app/components/crud/button-new-item"

interface OrderManagerProps {
    order: Order
}
const OrderManager = ({ order }: OrderManagerProps) => {
    const [groupedItems, setGroupedItems] = useState<Record<string, GroupItem[]>>({})
    const context = useCategories();

    useEffect(() => {
        const items = groupBy(order.groups, "category_id");
        setGroupedItems(items);
    }, [order])

    return (
        <div className="flex h-[80vh] bg-gray-100">
            {/* Lado Esquerdo */}
            <div className="flex-1 p-4 bg-white overflow-y-auto">
                <div className="flex justify-between items-center mb-2">
                    <h1 className="text-xl font-bold mb-4">Meus Itens</h1>
                    <button className="w-1/5 bg-green-500 text-white py-2 rounded-lg mb-4">+ Item</button>
                    <ButtonNewItem name="item" modalName="list-products">
                        <PageListProducts />
                        </ButtonNewItem>
                </div>

                {Object.entries(groupedItems).map(([key, groups], index) => (
                    <CategoryOrder key={index} categoryName={context.findByID(key)!.name} groups={groups} />
                ))}   
            </div>

            {/* Lado Direito */}
            <div className="w-80 bg-gray-50 p-4 overflow-y-auto">
                {/* Fechar Pedido */}
                <div className="bg-yellow-100 p-4 rounded-lg mb-4">
                    <button className="w-full bg-yellow-500 text-white py-2 rounded-lg mb-4">
                        Fechar Pedido
                    </button>
                    <p>Subtotal: R$ 15,00</p>
                    <p>Taxa de entrega: R$ 5,00</p>
                    <p>Desconto: R$ 5,00</p>
                    <hr className="my-2" />
                    <p className="font-bold">Total: R$ 15,00</p>
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
        </div>
    )
}

function groupBy<T extends Record<string, any>>(array: T[], key: keyof T): Record<string, T[]> {
    if (!array || array.length === 0) {
        return {};
    }
    return array.reduce((result, currentItem) => {
        const groupKey = currentItem[key] as string;

        if (!result[groupKey]) {
            result[groupKey] = [];
        }
        result[groupKey].push(currentItem);
        return result;
    }, {} as Record<string, T[]>);
}

export default OrderManager