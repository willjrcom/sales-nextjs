'use client';

import RequestError from "@/app/utils/error";
import NewOrderTable from "@/app/api/order-table/new/order-table";
import Table from "@/app/entities/table/table";
import { SelectField } from "@/app/components/modal/field";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import PageTitle from "@/app/components/PageTitle";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { fetchPlaces } from "@/redux/slices/places";
import { notifyError } from "@/app/utils/notifications";

const PageNewOrderTable = () => {
    const [placeID, setPlaceID] = useState<string>('');
    const [tableID, setTableID] = useState<string>('');
    const [tables, setTables] = useState<Table[]>([]);
    const router = useRouter();
    const placesSlice = useSelector((state: RootState) => state.places);
    const dispatch = useDispatch<AppDispatch>();
    const { data } = useSession();

    useEffect(() => {
        const token = data?.user?.access_token;
        const hasPlacesSlice = placesSlice.ids.length > 0;

        if (token && !hasPlacesSlice) {
            dispatch(fetchPlaces({ session: data }));
        }

        const interval = setInterval(() => {
            const token = data?.user?.access_token;
            const hasPlacesSlice = placesSlice.ids.length > 0;

            if (token && !hasPlacesSlice) {
                dispatch(fetchPlaces({ session: data }));
            }
        }, 60000); // Atualiza a cada 60 segundos

        return () => clearInterval(interval); // Limpa o intervalo ao desmontar o componente
    }, [data?.user.access_token, placesSlice.ids.length]);

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
        } catch (error: RequestError | any) {
            notifyError(error.message || 'Ocorreu um erro ao criar o pedido');
        }
    }

    return (
        <div className="flex items-center justify-center min-h-full p-4">
            <div className="w-full max-w-md bg-white p-6 rounded-md shadow space-y-6">
                <PageTitle
                    title="Novo Pedido Mesa"
                    tooltip="Selecione o local e a mesa para iniciar o pedido."
                />
                <SelectField
                    friendlyName="Local"
                    name="local"
                    selectedValue={placeID}
                    setSelectedValue={setPlaceID}
                    values={Object.values(placesSlice.entities)}
                />
                <SelectField
                    friendlyName="Mesa"
                    name="mesa"
                    selectedValue={tableID}
                    setSelectedValue={setTableID}
                    values={tables}
                />

                <button
                    disabled={!tableID}
                    onClick={() => newOrder(tableID)}
                    className="flex items-center justify-center w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed space-x-2"
                >
                    <FaPlus />
                    <span>Iniciar Pedido</span>
                </button>
            </div>
        </div>
    );
}

export default PageNewOrderTable;