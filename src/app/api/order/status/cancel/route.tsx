import RequestApi, { AddIdToken } from "../../../request";
import { Session } from "next-auth";

const CancelOrder = async (order_id: string, session: Session): Promise<string> => {
    const response = await RequestApi<null, string>({
        path: "/order/cancel/" + order_id, 
        method: "POST",
        headers: await AddIdToken(session),
    });

    return response.data
};

export default CancelOrder