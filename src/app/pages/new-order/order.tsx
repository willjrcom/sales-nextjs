import CategoryOrder from "@/app/components/order/category"
import { GroupItem } from "@/app/entities/order/group-item"
import Order from "@/app/entities/order/order"
import { useEffect, useState } from "react"

interface OrderManagerProps {
    order: Order
}
const OrderManager = ({ order }: OrderManagerProps) => {
    const [groupedItems, setGroupedItems] = useState<Record<string, GroupItem[]>>({})

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
                </div>

                {Object.values(groupedItems).map((groups, index) => (
                    <CategoryOrder key={index} groups={groups} />
                ))}
                {/* Categoria: Bebidas */}
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-lg font-semibold">Bebidas</h2>
                        <button className="text-blue-500 underline">Editar</button>
                    </div>
                    <div className="flex space-x-4 overflow-x-auto">
                        <div className="p-4 border rounded-lg bg-gray-50">2 x Coca cola lata</div>
                    </div>
                    <hr />
                    <p className="text-right mt-2">Subtotal: R$ 40,00</p>
                </div>


                {/* Categoria: Sobremesas */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-lg font-semibold">Sobremesas</h2>
                        <button className="text-blue-500 underline">Editar</button>
                    </div>
                    <div className="flex space-x-4 overflow-x-auto">
                        <div className="p-4 border rounded-lg bg-gray-50">2 x Milk-shake</div>
                    </div>
                    <hr />
                    <p className="text-right mt-2">Subtotal: R$ 40,00</p>
                </div>
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
        console.log(groupKey)
        result[groupKey].push(currentItem);
        return result;
    }, {} as Record<string, T[]>);
}

export default OrderManager