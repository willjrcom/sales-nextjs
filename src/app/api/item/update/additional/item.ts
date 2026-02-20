import RequestApi, { AddAccessToken } from "../../../request";
import { Session } from "next-auth";

export interface NewItemProps {
    product_id: string;
    quantity: number;
    variation_id?: string;
}

const NewAdditionalItem = async (itemId: string, body: NewItemProps, session: Session): Promise<string> => {
    const response = await RequestApi<NewItemProps, string>({
        path: "/item/update/" + itemId + "/additional",
        method: "POST",
        body: body,
        headers: AddAccessToken(session),
    });

    return response.data
};

export default NewAdditionalItem