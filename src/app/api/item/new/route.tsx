import RequestApi, { AddIdToken } from "../../request";
import { Session } from "next-auth";

export interface NewItemProps {
    order_id: string;
    product_id: string;
    quantity_id: string;
    group_item_id?: string;
    observation: string;
}

export interface NewItemResponse {
    item_id: string;
    group_item_id: string;
}

const NewItem = async (body: NewItemProps, session: Session): Promise<NewItemResponse> => {
    const response = await RequestApi<NewItemProps, NewItemResponse>({
        path: "/item/add", 
        method: "POST",
        body: body,
        headers: await AddIdToken(session),
    });

    return response.data
};

export default NewItem