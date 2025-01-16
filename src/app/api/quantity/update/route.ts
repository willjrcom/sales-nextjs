import Quantity from "@/app/entities/quantity/quantity";
import RequestApi, { AddIdToken } from "../../request";
import { Session } from "next-auth";

const UpdateQuantity = async (quantity: Quantity, session: Session): Promise<string> => {
    const response = await RequestApi<Quantity, string>({
        path: "/product-category/quantity/update/" + quantity.id, 
        method: "PATCH",
        body: quantity,
        headers: await AddIdToken(session),
    });

    return response.data
};

export default UpdateQuantity