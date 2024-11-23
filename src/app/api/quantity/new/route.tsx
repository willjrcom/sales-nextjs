import Quantity from "@/app/entities/quantity/quantity";
import RequestApi, { AddIdToken } from "../../request";
import { Session } from "next-auth";

const NewQuantity = async (quantity: Quantity, session: Session): Promise<string> => {
    const response = await RequestApi<Quantity, string>({
        path: "/product-category/quantity/new", 
        method: "POST",
        body: quantity,
        headers: await AddIdToken(session),
    });

    return response.data
};

export default NewQuantity