import RequestApi, { AddIdToken } from "../../../request";
import { Session } from "next-auth";

const ReadyOrder = async (order_id: string, session: Session): Promise<string> => {
    const response = await RequestApi<null, string>({
        path: "/order/ready/" + order_id, 
        method: "POST",
        headers: await AddIdToken(session),
    });

    return response.data
};

export default ReadyOrder