import RequestApi, { AddIdToken } from "@/app/api/request";
import { Session } from "next-auth";

interface ShipOrderProps {
    driver_id: string;
}

const ShipOrderDelivery = async (delivery_id: string, driver_id: string, session: Session): Promise<string> => {
    const body = { driver_id: driver_id } as ShipOrderProps
    const response = await RequestApi<ShipOrderProps, string>({
        path: "/order-delivery/update/ship/" + delivery_id, 
        method: "POST",
        body: body,
        headers: await AddIdToken(session),
    });

    return response.data
};

export default ShipOrderDelivery