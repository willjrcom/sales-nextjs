import RequestApi, { AddIdToken } from "../../../request";
import { Session } from "next-auth";

const FinishOrder = async (order_id: string, session: Session): Promise<string> => {
    const response = await RequestApi<null, string>({
        path: "/order/finish/" + order_id, 
        method: "POST",
        headers: await AddIdToken(session),
    });

    return response.data
};

export default FinishOrder