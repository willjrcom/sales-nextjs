import RequestApi, { AddAccessToken } from "../request";
import { Session } from "next-auth";

const GetShiftPrintByID = async (id: string, session: Session, format?: string): Promise<string> => {
    const response = await RequestApi<never, string>({
        path: "/print-manager/shift/" + id + (format ? `?format=${format}` : ""),
        method: "GET",
        headers: AddAccessToken(session),
    });
    return response.data;
};

export default GetShiftPrintByID;
