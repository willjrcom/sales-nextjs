'use client';

import RequestError from "@/app/api/error";
import NewOrderPickup from "@/app/api/order-pickup/new/route";
import { TextField } from "@/app/components/modal/field";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaPlus } from "react-icons/fa";

const PageNewOrderPickup = () => {
    const [orderName, setOrderName] = useState('');
    const [error, setError] = useState<RequestError | null>(null)
    const router = useRouter();
    const { data } = useSession();

    const newOrder = async (name: string) => {
        if (!data) return
        try {
            const response = await NewOrderPickup(name, data)
            router.push('/pages/order-control/' + response.order_id)
            setError(null)
        } catch (error) {
            setError(error as RequestError)
        }
    }

    return (
        <>
            <div className="flex items-center space-x-4">
                <div className="flex flex-col w-1/3">
                    <label htmlFor="contato" className="text-sm font-semibold mb-1">Balcão/Retirada</label>
                    <TextField 
                        name="contato" 
                        placeholder="Digite o nome do pedido" 
                        setValue={setOrderName} 
                        value={orderName} 
                    />
                </div>
                {error && <p className="mb-4 text-red-500">{error.message}</p>}
                <div hidden={orderName.length === 0}>
                    <button onClick={() => newOrder(orderName)} className="flex items-center space-x-2 p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 w-max">
                        <FaPlus />
                        <span> Iniciar pedido</span>
                    </button>
                </div>
            </div>
        </>
    )
}

export default PageNewOrderPickup