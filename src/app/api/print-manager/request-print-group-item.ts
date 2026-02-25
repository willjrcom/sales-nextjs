import RequestApi, { AddAccessToken } from "../request";
import { Session } from "next-auth";

const RequestGroupItemPrintByID = async (id: string, session: Session, format?: string): Promise<string> => {
    const response = await RequestApi<never, string>({
        path: "/print-manager/group-item/" + id + (format ? `?format=${format}` : ""),
        method: "POST",
        headers: AddAccessToken(session),
    });
    return response.data
};

export default RequestGroupItemPrintByID