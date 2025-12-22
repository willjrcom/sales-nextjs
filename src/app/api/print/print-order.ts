import RequestApi, { AddAccessToken } from "../request";
import { Session } from "next-auth";

const GetOrderPrintByID = async (id: string, session: Session): Promise<string> => {
    const response = await RequestApi<never, string>({
        path: "/order-print/" + id, 
        method: "GET",
        headers: AddAccessToken(session),
    });
    return response.data
};

export default GetOrderPrintByID