import RequestApi, { AddAccessToken } from "../../../request";
import { Session } from "next-auth";

export interface NewItemProps {
    product_id: string;
    quantity_id: string;
}

const NewAdditionalItem = async (itemId: string, body: NewItemProps, session: Session): Promise<string> => {
    const response = await RequestApi<NewItemProps, string>({
        path: "/item/update/" + itemId + "/additional", 
        method: "POST",
        body: body,
        headers: await AddAccessToken(session),
    });

    return response.data
};

export default NewAdditionalItem