import RequestApi, { AddAccessToken } from "../../request";
import { Session } from "next-auth";

export interface OrderAdditionalItemCreateDTO {
    product_id: string;
    variation_id?: string;
    quantity: number;
    flavor?: string;
}

export interface NewItemProps {
    order_id: string;
    product_id: string;
    quantity: number;
    group_item_id?: string;
    observation: string;
    flavor?: string;
    variation_id: string;
    additions?: OrderAdditionalItemCreateDTO[];
    removed_items?: { name: string }[];
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
        headers: AddAccessToken(session),
    });

    return response.data
};

export default NewItem