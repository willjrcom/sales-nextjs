import RequestApi, { AddAccessToken } from "../request";
import { Session } from "next-auth";

const GetOrderPrintByID = async (id: string, session: Session, format?: string): Promise<string> => {
    const response = await RequestApi<never, string>({
        path: "/order-print/" + id + (format ? `?format=${format}` : ""),
        method: "GET",
        headers: AddAccessToken(session),
    });
    return response.data
};

export default GetOrderPrintByID