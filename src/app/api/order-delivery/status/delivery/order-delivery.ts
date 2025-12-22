import RequestApi, { AddAccessToken } from "@/app/api/request";
import { Session } from "next-auth";

const DeliveryOrderDelivery = async (delivery_id: string, session: Session): Promise<string> => {
    const response = await RequestApi<null, string>({
        path: "/order-delivery/update/delivery/" + delivery_id, 
        method: "POST",
        headers: AddAccessToken(session),
    });

    return response.data
};

export default DeliveryOrderDelivery