import RequestApi, { AddIdToken } from "../../../request";
import { Session } from "next-auth";


const NewComplementGroupItem = async (groupItemId: string, productId: string, session: Session): Promise<null> => {
    const response = await RequestApi<null, null>({
        path: "/group-item/update/" + groupItemId + "/complement-item/" + productId, 
        method: "POST",
        headers: await AddIdToken(session),
    });
    return response.data
};

export default NewComplementGroupItem