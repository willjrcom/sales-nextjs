'use client';

import RequestError from "@/app/api/error";
import NewOrderTable from "@/app/api/order-table/new/route";
import { usePlaces } from "@/app/context/place/context";
import Table from "@/app/entities/table/table";
import { SelectField } from "@/app/forms/field";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";

const PageNewOrderTable = () => {
    const [placeID, setPlaceID] = useState<string>('');
    const [tableID, setTableID] = useState<string>('');
    const [tables, setTables] = useState<Table[]>([]);
    const [error, setError] = useState<RequestError | null>(null);
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
        try {
            const response = await NewOrderTable(tableID, data)
            router.push('/pages/new-order/table/' + response.order_id)
            setError(null);
        } catch (error) {
            setError(error as RequestError);
        }
    }

    return (
        <>
            <SelectField
                friendlyName="Local" name="local" selectedValue={placeID} setSelectedValue={setPlaceID} values={contextPlace.items} />
            <SelectField
                friendlyName="Mesa" name="mesa" selectedValue={tableID} setSelectedValue={setTableID} values={tables} />

            {error && <p className="mb-4 text-red-500">{error.message}</p>}
            <div hidden={tableID.length === 0}>
                <button onClick={() => newOrder(tableID)} className="flex items-center space-x-2 p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 w-max">
                        <FaPlus />
                        <span>Novo pedido mesa</span>
                </button>
            </div>
        </>
    )
}

export default PageNewOrderTable;