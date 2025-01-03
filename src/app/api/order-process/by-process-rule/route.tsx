import OrderProcess from "@/app/entities/order-process/order-process";
import RequestApi, { AddIdToken } from "../../request";
import { Session } from "next-auth";

const GetProcessesByProcessRuleID = async (id: string, session: Session): Promise<OrderProcess[]> => {
    const response = await RequestApi<null, OrderProcess[]>({
        path: "/order-process/by-process-rule/" + id, 
        method: "GET",
        headers: await AddIdToken(session),
    });

    return response.data
};

export default GetProcessesByProcessRuleID