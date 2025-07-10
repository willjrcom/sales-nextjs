import StockMovement from "@/app/entities/stock/stock-movement";
import RequestApi, { AddAccessToken } from "../request";
import { Session } from "next-auth";

const GetMovementsByStockID = async (stockID: string, session: Session): Promise<StockMovement[]> => {
    const response = await RequestApi<null, StockMovement[]>({
        path: `/stock/movements/${stockID}`, 
        method: "GET",
        headers: await AddAccessToken(session),
    });

    return response.data
};

export {
    GetMovementsByStockID
}; 