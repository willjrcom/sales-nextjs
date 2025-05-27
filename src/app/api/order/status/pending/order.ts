import RequestApi, { AddAccessToken } from "../../../request";
import { Session } from "next-auth";

const PendingOrder = async (order_id: string, session: Session): Promise<string> => {
    const response = await RequestApi<null, string>({
        path: "/order/pending/" + order_id, 
        method: "POST",
        headers: await AddAccessToken(session),
    });

    return response.data
};

export default PendingOrder