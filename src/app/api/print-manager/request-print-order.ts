import RequestApi, { AddAccessToken } from "../request";
import { Session } from "next-auth";

const RequestOrderPrintByID = async (id: string, session: Session, format?: string): Promise<string> => {
    const response = await RequestApi<never, string>({
        path: "/print-manager/order/" + id + (format ? `?format=${format}` : ""),
        method: "POST",
        headers: AddAccessToken(session),
    });
    return response.data
};

export default RequestOrderPrintByID