'use client';

import Menu from "@/app/components/menu/layout";
import { useTables } from "@/app/context/table/context";
import Table from "@/app/entities/table/table";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Order from "../../order";

const PageNewOrderTable = () => {
    return (
        <Menu>
            <Page/>
        </Menu>
    );
}

const Page = () => {
    const { id } = useParams();
    const context = useTables();
    const [table, setTable] = useState<Table | null>();
    
    useEffect(() => {
        setTable(context.findByID(id as string))
    }, [id, context]);

    if (!id) {
        return (
            <h1>Mesa não encontrada</h1>
        )
    }
    
    return (
        <>
            <h1>{table?.name}</h1>
            <Order/>
        </>
    );
}
export default PageNewOrderTable