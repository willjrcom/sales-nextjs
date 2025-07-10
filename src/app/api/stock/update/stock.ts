import Stock from "@/app/entities/stock/stock";
import RequestApi, { AddAccessToken } from "../../request";
import { Session } from "next-auth";

const UpdateStock = async (stock: Stock, session: Session): Promise<void> => {
    await RequestApi<Stock, void>({
        path: `/stock/update/${stock.id}`, 
        method: "PUT",
        body: stock,
        headers: await AddAccessToken(session),
    });
};

export default UpdateStock 