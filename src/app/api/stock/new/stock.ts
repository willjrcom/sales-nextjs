import Stock from "@/app/entities/stock/stock";
import RequestApi, { AddAccessToken } from "../../request";
import { Session } from "next-auth";

const NewStock = async (stock: Stock, session: Session): Promise<string> => {
    const response = await RequestApi<Stock, string>({
        path: "/stock/new", 
        method: "POST",
        body: stock,
        headers: AddAccessToken(session),
    });

    return response.data
};

export default NewStock 