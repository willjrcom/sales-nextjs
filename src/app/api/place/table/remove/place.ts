import RequestApi, { AddAccessToken } from "../../../request";
import { Session } from "next-auth";

const RemoveTableFromPlace = async (id: string, session: Session): Promise<string> => {
    const response = await RequestApi<string, string>({
        path: "/place/table/" + id, 
        method: "DELETE",
        headers: AddAccessToken(session),
    });

    return response.data
};

export default RemoveTableFromPlace