import RequestApi, { AddAccessToken, GetAllResponse } from "../request";
import { Session } from "next-auth";
import DeliveryDriver from "@/app/entities/delivery-driver/delivery-driver";

const GetAllDeliveryDrivers = async (session: Session, page?: number, perPage?: number): Promise<GetAllResponse<DeliveryDriver>> => {
    const response = await RequestApi<null, DeliveryDriver[]>({
        path: `/delivery-driver/all?page=${page}&per_page=${perPage}`, 
        method: "GET",
        headers: await AddAccessToken(session),
    });
    return {items: response.data, headers: response.headers}
};

export default GetAllDeliveryDrivers