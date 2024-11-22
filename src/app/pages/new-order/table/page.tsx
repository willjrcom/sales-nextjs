'use client';

import Menu from "@/app/components/menu/layout";
import { usePlaces } from "@/app/context/place/context";
import Table from "@/app/entities/table/table";
import { SelectField } from "@/app/forms/field";
import { useEffect, useState } from "react";

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
        const filteredPlaces = contextPlace.filterItems!('id', placeID)
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
        </>
    )
}

export default PageNewOrderTable;