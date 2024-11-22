'use client';

import Menu from "@/app/components/menu/layout"
import Order from "../../order";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useClients } from "@/app/context/client/context";
import Client from "@/app/entities/client/client";

const PageNewOrderPickup = () => {
    return (
        <Menu>
            <Page/>
        </Menu>
    )
}

const Page = () => {
    const { name } = useParams();
    const context = useClients();
    
    if (!name) {
        return (
            <h1>Client não encontrado</h1>
        )
    }
    
    return (
        <>
            <h1>{name}</h1>
            <Order/>
        </>
    );
}
export default PageNewOrderPickup