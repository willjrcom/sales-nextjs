import RequestApi, { AddIdToken } from "../request";
import { Session } from "next-auth";
import DeliveryDriver from "@/app/entities/delivery-driver/delivery-driver";

const GetAllDeliveryDrivers = async (session: Session): Promise<DeliveryDriver[]> => {
    const response = await RequestApi<null, DeliveryDriver[]>({
        path: "/delivery-driver/all", 
        method: "GET",
        headers: await AddIdToken(session),
    });
    return response.data
};

export default GetAllDeliveryDrivers