'use client';

import Menu from "@/app/components/menu/layout";
import { usePlaces } from "@/app/context/place/context";
import Table from "@/app/entities/table/table";
import { SelectField } from "@/app/forms/field";
import Link from "next/link";
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

    useEffect(() => {
        if (!placeID) return;
        const filteredPlaces = contextPlace.filterItems('id', placeID)
        console.log(filteredPlaces)
        if (filteredPlaces.length > 0) {
            const place = filteredPlaces[0];

            const filteredTables: Table[] = [];
            for (const table of place.tables) {
                filteredTables.push(table.table)
            }
            setTables(filteredTables);
        }
    }, [placeID, contextPlace]);
    
    return (
        <>
            <SelectField
                friendlyName="Local" name="local" selectedValue={placeID} setSelectedValue={setPlaceID} values={contextPlace.items} />
            <SelectField
                friendlyName="Mesa" name="mesa" selectedValue={tableID} setSelectedValue={setTableID} values={tables} />
                <Link href={`/pages/new-order/table/${tableID}`} hidden={tableID === ''}>
                    <button className="flex items-center space-x-2 p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 w-max">
                        <FaPlus />
                        <span>Novo pedido mesa</span>
                    </button>
                </Link>
        </>
    )
}

export default PageNewOrderTable;