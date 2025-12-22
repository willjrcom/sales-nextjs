import RequestApi, { AddAccessToken } from "../../../request";
import { Session } from "next-auth";


const DeleteComplementGroupItem = async (groupItemId: string, session: Session): Promise<null> => {
    const response = await RequestApi<null, null>({
        path: "/group-item/update/" + groupItemId + "/complement-item", 
        method: "DELETE",
        headers: AddAccessToken(session),
    });
    return response.data
};

export default DeleteComplementGroupItem