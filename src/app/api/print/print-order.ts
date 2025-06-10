import RequestApi, { AddAccessToken } from "../request";
import { Session } from "next-auth";

const GerOrderPrintByID = async (id: string, session: Session): Promise<string> => {
    const response = await RequestApi<never, string>({
        path: "/order-print/" + id, 
        method: "GET",
        headers: await AddAccessToken(session),
    });
    return response.data
};

export default GerOrderPrintByID