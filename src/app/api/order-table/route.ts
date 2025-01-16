import RequestApi, { AddIdToken } from "../request";
import { Session } from "next-auth";
import OrderTable from "@/app/entities/order/order-table";

const GetOrderTables = async (session: Session): Promise<OrderTable[]> => {
    const response = await RequestApi<null, OrderTable[]>({
        path: "/order-table/all", 
        method: "GET",
        headers: await AddIdToken(session),
    });
    return response.data
};

export default GetOrderTables