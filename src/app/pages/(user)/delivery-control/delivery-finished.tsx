import RequestError from "@/app/api/error";
import ButtonIconTextFloat from "@/app/components/button/button-float";
import Refresh from "@/app/components/crud/refresh";
import CrudTable from "@/app/components/crud/table";
import Map, { Point } from "@/app/components/map/map";
import { SelectField } from "@/app/components/modal/field";
import { useModal } from "@/app/context/modal/context";
import Address from "@/app/entities/address/address";
import Employee from "@/app/entities/employee/employee";
import DeliveryOrderColumns from "@/app/entities/order/delivery-table-columns";
import Order from "@/app/entities/order/order";
import { fetchDeliveryDrivers } from "@/redux/slices/delivery-drivers";
import { fetchDeliveryOrders } from "@/redux/slices/delivery-orders";
import { AppDispatch, RootState } from "@/redux/store";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { FaCheck } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";

const DeliveryOrderFinished = () => {
    const dispatch = useDispatch<AppDispatch>();
    const deliveryOrdersSlice = useSelector((state: RootState) => state.deliveryOrders);
    const deliveryDriversSlice = useSelector((state: RootState) => state.deliveryDrivers);
    const [deliveryOrders, setDeliveryOrders] = useState<Order[]>([]);
    const [deliveryDrivers, setDeliveryDrivers] = useState<Employee[]>([]);
    const [centerPoint, setCenterPoint] = useState<Point | null>(null);
    const [points, setPoints] = useState<Point[]>([]);
    const [selectedRow, setSelectedRow] = useState<string>("");
    const [selectedDeliveryID, setSelectedDeliveryID] = useState<string>("");
    const [selectedDriverId, setSelectedDriverId] = useState<string>();
    const { data } = useSession();

    useEffect(() => {
        if (data && Object.keys(deliveryDriversSlice.entities).length === 0) {
            dispatch(fetchDeliveryDrivers(data));
        }
    }, [data?.user.idToken]);

    useEffect(() => {
        setDeliveryDrivers(Object.values(deliveryDriversSlice.entities).map((deliveryDriver) => deliveryDriver.employee));
    }, [deliveryDriversSlice.entities]);

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
        const shippedOrders = Object.values(deliveryOrdersSlice.entities).filter((order) => order.delivery?.status === 'Shipped')

        if (!selectedDriverId) {
            setDeliveryOrders(shippedOrders);
            return;
        }

        setDeliveryOrders(shippedOrders.filter((order) => order.delivery?.driver?.employee_id === selectedDriverId));
    }, [deliveryOrdersSlice.entities, selectedDriverId]);

    useEffect(() => {
        const order = deliveryOrdersSlice.entities[selectedRow]
        if (!order) return

        setSelectedDeliveryID(order.delivery?.id || "");
    }, [selectedRow]);

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
            <div className="flex justify-between items-center">
                <SelectField
                    friendlyName=""
                    name="name"
                    setSelectedValue={setSelectedDriverId}
                    selectedValue={selectedDriverId || ""}
                    values={deliveryDrivers}
                />
                <Refresh slice={deliveryOrdersSlice} fetchItems={fetchDeliveryOrders} />
            </div>
            <div className="flex flex-col md:flex-row gap-4 items-start">
                {/* Tabela */}
                <div className="w-full md:w-1/2 bg-white shadow-md rounded-lg p-4">
                    <CrudTable columns={DeliveryOrderColumns()} data={deliveryOrders} rowSelectionType="radio" selectedRow={selectedRow} setSelectedRow={setSelectedRow} />
                </div>
                {/* Mapa */}
                <div className="w-full md:w-1/2 bg-white shadow-md rounded-lg p-4">
                    <Map centerPoint={centerPoint} points={points} />
                </div>
            </div>
            {selectedRow && <ButtonIconTextFloat modalName="finish-delivery" icon={FaCheck} title="Finalizar entrega" position="bottom-right">
                <FinishDelivery deliveryID={selectedDeliveryID} />
            </ButtonIconTextFloat>}
        </>
    )
}

interface ModalData {
    deliveryID: string;
}

const FinishDelivery = ({ deliveryID }: ModalData) => {
    const dispatch = useDispatch<AppDispatch>();
    const [error, setError] = useState<RequestError | null>(null);
    const { data } = useSession();
    const modalHandler = useModal();
    const submit = () => {
        if (!data) return

        if (deliveryID === "") {
            setError(new RequestError('Selecione uma entrega'));
            return
        }

        setError(null);

        try {
            setError(null);
            dispatch(fetchDeliveryOrders(data));
            modalHandler.hideModal("ship-delivery");
        } catch (error) {
            setError(error as RequestError);
        }
    }

    return (
        <>
        {error && <p className="mb-4 text-red-500">{error.message}</p>}
        
        </>
    )
}

export default DeliveryOrderFinished