import RequestError from "@/app/api/error";
import ShipOrderDelivery from "@/app/api/order-delivery/update/ship/route";
import ButtonIconTextFloat from "@/app/components/button/button-float";
import Carousel from "@/app/components/carousel/carousel";
import Refresh from "@/app/components/crud/refresh";
import CrudTable from "@/app/components/crud/table";
import Map, { Point } from "@/app/components/map/map";
import { useModal } from "@/app/context/modal/context";
import Address from "@/app/entities/address/address";
import DeliveryDriver from "@/app/entities/delivery-driver/delivery-driver";
import DeliveryOrderColumns from "@/app/entities/order/delivery-table-columns";
import Order from "@/app/entities/order/order";
import { fetchDeliveryDrivers } from "@/redux/slices/delivery-drivers";
import { fetchDeliveryOrders } from "@/redux/slices/delivery-orders";
import { AppDispatch, RootState } from "@/redux/store";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { FaPaperPlane } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";

const DeliveryOrderToShip = () => {
    const deliveryOrdersSlice = useSelector((state: RootState) => state.deliveryOrders);
    const [deliveryOrders, setDeliveryOrders] = useState<Order[]>([]);
    const dispatch = useDispatch<AppDispatch>();
    const [centerPoint, setCenterPoint] = useState<Point | null>(null);
    const [points, setPoints] = useState<Point[]>([]);
    const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
    const [selectedDeliveryIDs, setSelectedDeliveryIDs] = useState<string[]>([]);
    const { data } = useSession();

    useEffect(() => {
        if (data && Object.keys(deliveryOrdersSlice.entities).length === 0) {
            dispatch(fetchDeliveryOrders(data));
        }

        const interval = setInterval(() => {
            if (data && !deliveryOrdersSlice) {
                dispatch(fetchDeliveryOrders(data));
            }
        }, 60000); // Atualiza a cada 60 segundos

        return () => clearInterval(interval); // Limpa o intervalo ao desmontar o componente
    }, [data?.user.idToken]);

    useEffect(() => {
        setDeliveryOrders(Object.values(deliveryOrdersSlice.entities).filter((order) => order.delivery?.status === 'Pending' && order.status === 'Ready'));
    }, [deliveryOrdersSlice.entities]);

    useEffect(() => {
        const deliveryIDs: string[] = []
        selectedRows.forEach((id) => deliveryIDs.push(deliveryOrdersSlice.entities[id].delivery?.id || ""));
        setSelectedDeliveryIDs(deliveryIDs);
    }, [selectedRows]);

    useEffect(() => {
        if (!data || !data?.user?.currentCompany?.address) return
        const company = data?.user?.currentCompany;
        const coordinates = company.address.coordinates

        const point = { id: company.id, lat: coordinates.latitude, lng: coordinates.longitude, label: company.trade_name } as Point;
        setCenterPoint(point);
    }, [data?.user.idToken])

    useEffect(() => {
        const newPoints: Point[] = [];
        for (let deliveryOrder of deliveryOrders) {
            const address = Object.assign(new Address(), deliveryOrder.delivery?.address);
            if (!address) continue;

            const coordinates = address.coordinates
            if (!coordinates) continue;

            const point = { id: deliveryOrder.id, lat: coordinates.latitude, lng: coordinates.longitude, label: address.getSmallAddress() } as Point;
            newPoints.push(point);
        }

        setPoints(newPoints);
    }, [deliveryOrders])

    return (
        <>
            <div className="flex justify-end items-center">
                <Refresh slice={deliveryOrdersSlice} fetchItems={fetchDeliveryOrders} />
            </div>
            <div className="flex flex-col md:flex-row gap-4 items-start">
                {/* Tabela */}
                <div className="w-full md:w-1/2 bg-white shadow-md rounded-lg p-4">
                    <CrudTable columns={DeliveryOrderColumns()} data={deliveryOrders} rowSelectionType="checkbox" selectedRows={selectedRows} setSelectedRows={setSelectedRows} />
                </div>
                {/* Mapa */}
                <div className="w-full md:w-1/2 bg-white shadow-md rounded-lg p-4">
                    <Map centerPoint={centerPoint} points={points} />
                </div>
            </div>
            {selectedRows.size > 0 && <ButtonIconTextFloat modalName="ship-delivery" icon={FaPaperPlane} title="Enviar entrega" position="bottom-right">
                <SelectDeliveryDriver deliveryIDs={selectedDeliveryIDs} />
            </ButtonIconTextFloat>}
        </>
    )
}

interface ModalData {
    deliveryIDs: string[];
}

const SelectDeliveryDriver = ({ deliveryIDs }: ModalData) => {
    const deliveryDriversSlice = useSelector((state: RootState) => state.deliveryDrivers);
    const dispatch = useDispatch<AppDispatch>();
    const [selectedDriver, setSelectedDriver] = useState<DeliveryDriver | null>();
    const [deliveryDrivers, setDeliveryDrivers] = useState<DeliveryDriver[]>([]);
    const [error, setError] = useState<RequestError | null>(null);
    const { data } = useSession();
    const modalHandler = useModal();

    useEffect(() => {
        if (data && Object.keys(deliveryDriversSlice.entities).length === 0) {
            dispatch(fetchDeliveryDrivers(data));
        }
    }, [data?.user.idToken]);

    useEffect(() => {
        setDeliveryDrivers(Object.values(deliveryDriversSlice.entities));
    }, [deliveryDriversSlice.entities]);

    const submit = async () => {
        if (!data) return

        if (deliveryIDs.length === 0) {
            setError(new RequestError('Selecione pelo menos uma entrega'));
            return
        }

        if (!selectedDriver) {
            setError(new RequestError('Selecione um entregador'));
            return
        };

        setError(null);

        const deliveryOrderIds = Array.from(deliveryIDs);
        try {
            await ShipOrderDelivery(deliveryOrderIds, selectedDriver.id, data);
            setError(null);
            dispatch(fetchDeliveryOrders(data));
            modalHandler.hideModal("ship-delivery");
        } catch (error) {
            setError(error as RequestError);
        }
    }

    return (
        <>
        <div className="items-center mb-4">
            <Carousel items={deliveryDrivers}>
                {(driver) => (
                    <li key={driver.id} className={`shadow-md border p-3 rounded-lg cursor-pointer ${selectedDriver?.id === driver.id ? 'bg-blue-100' : 'bg-white'}`} onClick={() => setSelectedDriver(driver)}>
                        <div className="text-center">
                            <p className="text-gray-700">
                                {driver.employee.name}
                            </p>
                            <p className="text-gray-700">
                                Na rua
                            </p>
                        </div>
                    </li>
                )}
            </Carousel>
            </div>
            {error && <p className="text-red-500 mb-4">{error.message}</p>}
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" onClick={submit}>Enviar entregas</button>
        </>
    )
}

export default DeliveryOrderToShip