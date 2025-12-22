import RequestApi, { AddAccessToken } from "../../request";
import { Session } from "next-auth";

const FinishOrderProcess = async (id: string, session: Session): Promise<string> => {
    const response = await RequestApi<null, string>({
        path: "/order-process/finish/" + id, 
        method: "POST",
        headers: AddAccessToken(session),
    });

    return response.data
};

export default FinishOrderProcess