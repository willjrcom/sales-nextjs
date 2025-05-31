import RequestApi, { AddAccessToken, GetAllResponse } from "../request";
import { Session } from "next-auth";
import OrderTable from "@/app/entities/order/order-table";

const GetOrderTables = async (session: Session, page = 1, perPage = 10): Promise<GetAllResponse<OrderTable>> => {
    const response = await RequestApi<null, OrderTable[]>({
        path: `/order-table/all?page=${page}&per_page=${perPage}`,
        method: "GET",
        headers: await AddAccessToken(session),
    });
    return { items: response.data, headers: response.headers }
};

export default GetOrderTables