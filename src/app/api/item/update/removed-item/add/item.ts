import RequestApi, { AddIdToken } from "../../../../request";
import { Session } from "next-auth";

export interface AddRemovedItemProps {
    name: string;
}

const AddRemovedItem = async (itemId: string, name: string, session: Session): Promise<string> => {
    const body = { name: name };
    const response = await RequestApi<AddRemovedItemProps, string>({
        path: "/item/update/" + itemId + "/removed-item", 
        method: "POST",
        body: body,
        headers: await AddIdToken(session),
    });

    return response.data
};

export default AddRemovedItem