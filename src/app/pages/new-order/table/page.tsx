'use client';

import NewOrderTable from "@/app/api/order-table/new/route";
import Menu from "@/app/components/menu/layout";
import { usePlaces } from "@/app/context/place/context";
import Table from "@/app/entities/table/table";
import { SelectField } from "@/app/forms/field";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";

const PageNewOrderTable = () => {
    return (
        <Menu>
            <Component />
        </Menu>
    );
};

const Component = () => {
    const [placeID, setPlaceID] = useState<string>('');
    const [tableID, setTableID] = useState<string>('');
    const [tables, setTables] = useState<Table[]>([]);
    const contextPlace = usePlaces();
    const router = useRouter();
    const { data } = useSession();

    useEffect(() => {
        if (!placeID) return;
        const filteredPlaces = contextPlace.filterItems('id', placeID)
        if (filteredPlaces.length > 0) {
            const place = filteredPlaces[0];

            const filteredTables: Table[] = [];
            for (const table of place.tables) {
                filteredTables.push(table.table)
            }
            setTables(filteredTables);
        }
    }, [placeID, contextPlace]);
    
    const newOrder = async (tableID: string) => {
        event?.preventDefault();
        if (!data) return
        const response = await NewOrderTable(tableID, data)
        router.push('/pages/new-order/table/' + response.order_id)
    }

    return (
        <>
            <SelectField
                friendlyName="Local" name="local" selectedValue={placeID} setSelectedValue={setPlaceID} values={contextPlace.items} />
            <SelectField
                friendlyName="Mesa" name="mesa" selectedValue={tableID} setSelectedValue={setTableID} values={tables} />
                <Link href={""} hidden={tableID === ''} onClick={() => newOrder(tableID)}>
                    <button className="flex items-center space-x-2 p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 w-max">
                        <FaPlus />
                        <span>Novo pedido mesa</span>
                    </button>
                </Link>
        </>
    )
}

export default PageNewOrderTable;