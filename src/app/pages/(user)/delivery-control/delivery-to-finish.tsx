import RequestError from "@/app/api/error";
import DeliveryOrderDelivery from "@/app/api/order-delivery/update/delivery/route";
import FinishOrderDelivery from "@/app/api/order-delivery/update/ship/route";
import ButtonIconTextFloat from "@/app/components/button/button-float";
import Carousel from "@/app/components/carousel/carousel";
import Refresh from "@/app/components/crud/refresh";
import CrudTable from "@/app/components/crud/table";
import Map, { Point } from "@/app/components/map/map";
import { SelectField } from "@/app/components/modal/field";
import CardOrder from "@/app/components/order/card-order";
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

const DeliveryOrderToFinish = () => {
    const dispatch = useDispatch<AppDispatch>();
    const deliveryOrdersSlice = useSelector((state: RootState) => state.deliveryOrders);
    const deliveryDriversSlice = useSelector((state: RootState) => state.deliveryDrivers);
    const [deliveryOrders, setDeliveryOrders] = useState<Order[]>([]);
    const [deliveryDrivers, setDeliveryDrivers] = useState<Employee[]>([]);
    const [centerPoint, setCenterPoint] = useState<Point | null>(null);
    const [points, setPoints] = useState<Point[]>([]);
    const [orderID, setSelectedOrderID] = useState<string>("");
    const [selectedDeliveryID, setSelectedDeliveryID] = useState<string>("");
    const [selectedDriverId, setSelectedDriverId] = useState<string>();
    const { data } = useSession();

    useEffect(() => {
        setDeliveryDrivers(Object.values(deliveryDriversSlice.entities).map((deliveryDriver) => deliveryDriver.employee));
    }, [deliveryDriversSlice.entities]);

    useEffect(() => {
        if (data && Object.keys(deliveryOrdersSlice.entities).length === 0) {
            dispatch(fetchDeliveryOrders(data));
        }

        const interval = setInterval(() => {
            if (data) {
                dispatch(fetchDeliveryOrders(data));
            }
        }, 10000); // Atualiza a cada 30 segundos

        return () => clearInterval(interval); // Limpa o intervalo ao desmontar o componente
    }, [data?.user.idToken, dispatch]);

    useEffect(() => {
        const shippedOrders = Object.values(deliveryOrdersSlice.entities).filter((order) => order.delivery?.status === 'Shipped' && order.status === 'Ready')

        if (!selectedDriverId) {
            setDeliveryOrders(shippedOrders);
            return;
        }

        setDeliveryOrders(shippedOrders.filter((order) => order.delivery?.driver?.employee_id === selectedDriverId));
    }, [deliveryOrdersSlice.entities, selectedDriverId]);

    useEffect(() => {
        const order = deliveryOrdersSlice.entities[orderID]
        if (!order) return

        setSelectedDeliveryID(order.delivery?.id || "");
    }, [orderID]);

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
                    <CrudTable columns={DeliveryOrderColumns()} data={deliveryOrders} rowSelectionType="radio" selectedRow={orderID} setSelectedRow={setSelectedOrderID} />
                </div>
                {/* Mapa */}
                <div className="w-full md:w-1/2 bg-white shadow-md rounded-lg p-4">
                    <Map centerPoint={centerPoint} points={points} />
                </div>
            </div>
            {orderID && <ButtonIconTextFloat modalName="finish-delivery" icon={FaCheck} title="Finalizar entrega" position="bottom-right">
                <FinishDelivery deliveryID={selectedDeliveryID} orderID={orderID}/>
            </ButtonIconTextFloat>}
        </>
    )
}

interface ModalData {
    deliveryID: string;
    orderID: string;
}

const FinishDelivery = ({ deliveryID, orderID }: ModalData) => {
    const dispatch = useDispatch<AppDispatch>();
    const [error, setError] = useState<RequestError | null>(null);
    const { data } = useSession();
    const modalHandler = useModal();

    const showOrder = (orderId: string, error?: RequestError | null) => {
        const onClose = () => {
            modalHandler.hideModal("show-order-" + orderId)
        }
        modalHandler.showModal(
            "show-order-" + orderId,
            "Ver Pedido",
            <CardOrder orderId={orderId} errorRequest={error} />,
            "xl",
            onClose
        );
    };

    const submit = async () => {
        if (!data) return

        if (!deliveryID) {
            setError(new RequestError('Selecione uma entrega'));
            return
        }

        setError(null);

        try {
            await DeliveryOrderDelivery(deliveryID, data);
            setError(null);
            dispatch(fetchDeliveryOrders(data));
            modalHandler.hideModal("finish-delivery");
            showOrder(orderID)
        } catch (error) {
            setError(error as RequestError);
        }
    }

    return (
        <>
        <div className="items-center mb-4">
                <p className="text-sm text-gray-600">Confirma que a entrega foi finalizada?</p>
            </div>
            {error && <p className="text-red-500 mb-4">{error.message}</p>}
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" onClick={submit}>Confirmar entrega</button>
        </>
    )
}

export default DeliveryOrderToFinish