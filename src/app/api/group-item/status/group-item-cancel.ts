import RequestApi, { AddAccessToken } from "../../request";
import { Session } from "next-auth";

const CancelGroupItem = async (groupItemID: string, reason: string, session: Session): Promise<string> => {
    const response = await RequestApi<Object, string>({
        path: "/group-item/cancel/" + groupItemID,
        method: "POST",
        body: { reason },
        headers: await AddAccessToken(session),
    });

    return response.data
};

export default CancelGroupItem