'use client';

import NewOrderPickup from "@/app/api/order-pickup/new/route";
import { TextField } from "@/app/forms/field";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaCheck } from "react-icons/fa";

const PageNewOrderPickup = () => {
    const [orderName, setOrderName] = useState('');
    const router = useRouter();
    const { data } = useSession();

    const newOrder = async (name: string) => {
        if (!data) return
        const response = await NewOrderPickup(name, data)
        router.push('/pages/new-order/pickup/' + response.order_id)
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
                <button onClick={() => newOrder(orderName)} className="flex items-center space-x-2 p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 w-max">
                    <FaCheck />
                    <span> Iniciar pedido</span>
                </button>
            </div>
        </>
    )
}

export default PageNewOrderPickup