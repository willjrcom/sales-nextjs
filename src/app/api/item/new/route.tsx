import RequestApi, { AddIdToken } from "../../request";
import { Session } from "next-auth";

interface NewItemProps {
    order_id: string;
    product_id: string;
    quantity_id: string;
    group_item_id?: string;
    observation: string;
}

const NewItem = async (body: NewItemProps, session: Session): Promise<string> => {
    const response = await RequestApi<NewItemProps, string>({
        path: "/item/new", 
        method: "POST",
        body: body,
        headers: await AddIdToken(session),
    });

    return response.data
};

export default NewItem