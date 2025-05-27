import RequestApi, { AddAccessToken } from "../../../request";
import { Session } from "next-auth";


const DeleteAdditionalItem = async (additionalItemId: string, session: Session): Promise<string> => {
    const response = await RequestApi<null, string>({
        path: "/item/delete/" + additionalItemId + "/additional", 
        method: "DELETE",
        headers: await AddAccessToken(session),
    });

    return response.data
};

export default DeleteAdditionalItem