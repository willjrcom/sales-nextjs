'use client';

import RequestError from "@/app/api/error";
import NewOrderTable from "@/app/api/order-table/new/order-table";
import Table from "@/app/entities/table/table";
import { SelectField } from "@/app/components/modal/field";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { fetchPlaces } from "@/redux/slices/places";

const PageNewOrderTable = () => {
    const [placeID, setPlaceID] = useState<string>('');
    const [tableID, setTableID] = useState<string>('');
    const [tables, setTables] = useState<Table[]>([]);
    const [error, setError] = useState<RequestError | null>(null);
    const router = useRouter();
    const placesSlice = useSelector((state: RootState) => state.places);
    const dispatch = useDispatch<AppDispatch>();
    const { data } = useSession();

    useEffect(() => {
        if (data && Object.keys(placesSlice.entities).length === 0) {
            dispatch(fetchPlaces(data));
        }

        const interval = setInterval(() => {
            if (data) {
                dispatch(fetchPlaces(data));
            }
        }, 60000); // Atualiza a cada 60 segundos

        return () => clearInterval(interval); // Limpa o intervalo ao desmontar o componente
    }, [data?.user.idToken, dispatch]);

    useEffect(() => {
        if (!placeID) return;
        const selectedPlace = placesSlice.entities[placeID];
        if (!selectedPlace) return

        const filteredTables: Table[] = [];
        for (const placeTable of selectedPlace.tables) {
            filteredTables.push(placeTable.table)
        }
        setTables(filteredTables);
    }, [placeID]);

    const newOrder = async (tableID: string) => {
        if (!data) return
        try {
            const response = await NewOrderTable(tableID, data)
            router.push('/pages/order-control/' + response.order_id)
            setError(null);
        } catch (error) {
            setError(error as RequestError);
        }
    }

    return (
        <>
            <SelectField
                friendlyName="Local" name="local" selectedValue={placeID} setSelectedValue={setPlaceID} values={Object.values(placesSlice.entities)} />
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