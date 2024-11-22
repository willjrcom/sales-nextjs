'use client';

import Menu from "@/app/components/menu/layout"
import Order from "../../order";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useClients } from "@/app/context/client/context";
import Client from "@/app/entities/client/client";

const PageNewOrderDelivery = () => {
    return (
        <Menu>
            <Page/>
        </Menu>
    )
}

const Page = () => {
    const { id } = useParams();
    const context = useClients();
    const [client, setClient] = useState<Client | null>();
    
    useEffect(() => {
        setClient(context.findByID(id as string))
    }, [id, context]);

    if (!id) {
        return (
            <h1>Client não encontrado</h1>
        )
    }
    
    return (
        <>
            <h1>{client?.name}</h1>
            <Order/>
        </>
    );
}
export default PageNewOrderDelivery