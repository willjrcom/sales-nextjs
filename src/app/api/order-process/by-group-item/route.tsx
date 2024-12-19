import { OrderProcess } from "@/app/entities/order-process/order-process";
import RequestApi, { AddIdToken } from "../../request";
import { Session } from "next-auth";

const GetProcessesByGroupItemID = async (id: string, session: Session): Promise<OrderProcess[]> => {
    const response = await RequestApi<null, OrderProcess[]>({
        path: "/order-process/by-group-item/" + id, 
        method: "GET",
        headers: await AddIdToken(session),
    });

    return response.data
};

export default GetProcessesByGroupItemID