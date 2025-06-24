import RequestApi, { AddAccessToken } from "../../request";
import { Session } from "next-auth";

interface CancelOrderProcessRequest {
    reason: string;
}

const CancelOrderProcess = async (id: string, reason: string, session: Session): Promise<string> => {
    const response = await RequestApi<CancelOrderProcessRequest, string>({
        path: "/order-process/cancel/" + id, 
        method: "POST",
        body: { reason },
        headers: await AddAccessToken(session),
    });

    return response.data
};

export default CancelOrderProcess 