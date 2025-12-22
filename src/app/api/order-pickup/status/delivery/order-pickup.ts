import RequestApi, { AddAccessToken } from "@/app/api/request";
import { Session } from "next-auth";

const DeliveryPickup = async (pickup_id: string, session: Session): Promise<string> => {
    const response = await RequestApi<null, string>({
        path: "/order-pickup/update/delivery/" + pickup_id, 
        method: "POST",
        headers: AddAccessToken(session),
    });

    return response.data
};

export default DeliveryPickup