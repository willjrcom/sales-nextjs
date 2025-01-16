import RequestApi, { AddIdToken } from "../../../../request";
import { Session } from "next-auth";

export interface RemoveRemovedItemProps {
    name: string;
}

const RemoveRemovedItem = async (itemId: string, name: string, session: Session): Promise<string> => {
    const body = { name: name };
    const response = await RequestApi<RemoveRemovedItemProps, string>({
        path: "/item/delete/" + itemId + "/removed-item", 
        method: "DELETE",
        body: body,
        headers: await AddIdToken(session),
    });

    return response.data
};

export default RemoveRemovedItem