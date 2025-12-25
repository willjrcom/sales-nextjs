'use client';

import RequestError from "@/app/utils/error";
import NewOrderTable from "@/app/api/order-table/new/order-table";
import Table from "@/app/entities/table/table";
import { SelectField } from "@/app/components/modal/field";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { FaPlus } from "react-icons/fa";
import PageTitle from "@/app/components/PageTitle";
import { notifyError } from "@/app/utils/notifications";
import { useQuery } from '@tanstack/react-query';
import GetPlaces from '@/app/api/place/place';

const PageNewOrderTable = () => {
    const [placeID, setPlaceID] = useState<string>('');
    const [tableID, setTableID] = useState<string>('');
    const router = useRouter();
    const { data } = useSession();

    const { data: placesResponse } = useQuery({
        queryKey: ['places'],
        queryFn: () => GetPlaces(data!),
        enabled: !!data?.user?.access_token,
    });

    const places = useMemo(() => placesResponse?.items || [], [placesResponse]);
    const selectedPlace = useMemo(() => {
        return places.find(p => p.id === placeID);
    }, [placeID, places]);

    const tables = useMemo(() => {
        if (!selectedPlace) return [];
        const filteredTables: Table[] = [];
        for (const placeTable of selectedPlace.tables) {
            filteredTables.push(placeTable.table);
        }
        return filteredTables;
    }, [selectedPlace]);

    const newOrder = async (tableID: string) => {
        if (!data) return;
        try {
            const response = await NewOrderTable(tableID, data);
            router.push('/pages/order-control/' + response.order_id);
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
                    values={places}
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