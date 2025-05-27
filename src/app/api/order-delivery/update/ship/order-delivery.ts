import RequestApi, { AddAccessToken } from "@/app/api/request";
import { Session } from "next-auth";

interface ShipOrderProps {
    driver_id: string;
    delivery_ids: string[];
}

const ShipOrderDelivery = async (deliveryOrderIds: string[], driverId: string, session: Session): Promise<string> => {
    const body = { driver_id: driverId, delivery_ids: deliveryOrderIds } as ShipOrderProps
    const response = await RequestApi<ShipOrderProps, string>({
        path: "/order-delivery/update/ship", 
        method: "POST",
        body: body,
        headers: await AddAccessToken(session),
    });

    return response.data
};

export default ShipOrderDelivery