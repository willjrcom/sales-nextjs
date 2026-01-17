import ButtonIcon from "../../button/button-icon";
import Order from "@/app/entities/order/order";
import StatusComponent from "../../button/show-status";
import { useEffect, useMemo, useState } from "react";
import { useCurrentOrder } from "@/app/context/current-order/context";
import { SelectField } from "@/app/components/modal/field";
import { useSession } from "next-auth/react";
import { notifyError, notifySuccess } from "@/app/utils/notifications";
import RequestError from "@/app/utils/error";
import ChangeTable from "@/app/api/order-table/update/change-table/order-table";
import { FaExchangeAlt } from "react-icons/fa";
import { useModal } from "@/app/context/modal/context";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import GetPlaces from '@/app/api/place/place';

const ChangeTableModal = ({ orderTableId }: { orderTableId: string }) => {
    const [placeID, setPlaceID] = useState<string>('');
    const [tableID, setTableID] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const queryClient = useQueryClient();
    const { data } = useSession();
    const modalHandler = useModal();
    const contextCurrentOrder = useCurrentOrder();

    const { data: placesResponse } = useQuery({
        queryKey: ['places'],
        queryFn: () => GetPlaces(data!),
        enabled: !!data?.user?.access_token,
    });

    const places = useMemo(() => placesResponse?.items || [], [placesResponse]);
    const selectedPlace = useMemo(() => places.find(p => p.id === placeID), [places, placeID]);
    const tables = useMemo(() => selectedPlace?.tables.map(t => t.table) || [], [selectedPlace]);

    const changeTable = async () => {
        if (!data || !tableID) return;

        setIsLoading(true);
        try {
            await ChangeTable(orderTableId, tableID, data);
            notifySuccess('Mesa alterada com sucesso');

            // Recarregar dados
            queryClient.invalidateQueries({ queryKey: ['places'] });
            queryClient.invalidateQueries({ queryKey: ['tableOrders'] });

            // Recarregar dados do pedido atual
            if (contextCurrentOrder.order) {
                await contextCurrentOrder.fetchData(contextCurrentOrder.order.id);
            }

            // Fechar modal
            modalHandler.hideModal("change-table-" + orderTableId);
        } catch (error: RequestError | any) {
            notifyError(error.message || 'Ocorreu um erro ao alterar a mesa');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="w-full max-w-md bg-white p-6 rounded-md shadow space-y-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Alterar Mesa</h2>
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
                disabled={!tableID || isLoading}
                onClick={changeTable}
                className="flex items-center justify-center w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed space-x-2"
            >
                <FaExchangeAlt />
                <span>{isLoading ? 'Alterando...' : 'Alterar Mesa'}</span>
            </button>
        </div>
    );
};

const TableCard = () => {
    const contextCurrentOrder = useCurrentOrder();
    const [order, setOrder] = useState<Order | null>(contextCurrentOrder.order);

    useEffect(() => {
        setOrder(contextCurrentOrder.order)
    }, [contextCurrentOrder.order])

    if (!order || !order.table) return null
    const table = order?.table;

    return (
        <div className="bg-white p-4 rounded-lg shadow-md mb-4">
            <div className="flex justify-between items-center">
                <h2 className="font-bold mb-2">{table?.name}</h2>
                <ButtonIcon
                    modalName={"change-table-" + order?.table?.id}
                    title="Alterar mesa"
                    size="md"
                    icon={FaExchangeAlt}
                >
                    <ChangeTableModal orderTableId={order.table.id} />
                </ButtonIcon>
            </div>

            {table?.status && <p><StatusComponent status={table?.status} /></p>}
        </div>
    )
}

export default TableCard