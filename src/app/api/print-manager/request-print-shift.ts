import RequestApi, { AddAccessToken } from "../request";
import { Session } from "next-auth";

const RequestShiftPrintByID = async (id: string, session: Session): Promise<string> => {
    const response = await RequestApi<never, string>({
        path: "/print-manager/shift/" + id,
        method: "POST",
        headers: AddAccessToken(session),
    });
    return response.data;
};

export default RequestShiftPrintByID;
