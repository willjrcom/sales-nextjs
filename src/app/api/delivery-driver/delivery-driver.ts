import RequestApi, { AddAccessToken, GetAllResponse } from "../request";
import { Session } from "next-auth";
import DeliveryDriver from "@/app/entities/delivery-driver/delivery-driver";

const GetAllDeliveryDrivers = async (session: Session, page?: number, perPage?: number, isActive: boolean = true): Promise<GetAllResponse<DeliveryDriver>> => {
    const response = await RequestApi<null, DeliveryDriver[]>({
        path: `/delivery-driver/all?page=${page}&per_page=${perPage}&is_active=${isActive}`,
        method: "GET",
        headers: AddAccessToken(session),
    });
    return { items: response.data, headers: response.headers }
};

export default GetAllDeliveryDrivers