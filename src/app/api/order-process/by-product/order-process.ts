import OrderProcess from "@/app/entities/order-process/order-process";
import RequestApi, { AddAccessToken } from "../../request";
import { Session } from "next-auth";

const GetProcessesByProductID = async (id: string, session: Session): Promise<OrderProcess[]> => {
    const response = await RequestApi<null, OrderProcess[]>({
        path: "/order-process/by-product/" + id, 
        method: "GET",
        headers: AddAccessToken(session),
    });

    return response.data
};

export default GetProcessesByProductID