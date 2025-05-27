import RequestApi, { AddAccessToken } from "../../request";
import { Session } from "next-auth";

const StartOrderProcess = async (id: string, session: Session): Promise<string> => {
    const response = await RequestApi<null, string>({
        path: "/order-process/start/" + id, 
        method: "POST",
        headers: await AddAccessToken(session),
    });

    return response.data
};

export default StartOrderProcess