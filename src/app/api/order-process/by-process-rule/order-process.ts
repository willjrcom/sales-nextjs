import OrderProcess from "@/app/entities/order-process/order-process";
import RequestApi, { AddAccessToken, GetAllResponse } from "../../request";
import { Session } from "next-auth";

const GetProcessesByProcessRuleID = async (id: string, session: Session): Promise<GetAllResponse<OrderProcess>> => {
    const response = await RequestApi<null, OrderProcess[]>({
        path: "/order-process/by-process-rule/" + id,
        method: "GET",
        headers: AddAccessToken(session),
    });

    return { items: response.data, headers: response.headers }
};

export default GetProcessesByProcessRuleID