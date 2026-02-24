import StockMovement from "@/app/entities/stock/stock-movement";
import RequestApi, { AddAccessToken } from "../request";
import { Session } from "next-auth";

const GetMovementsByStockID = async (session: Session, stockID: string, date?: string): Promise<StockMovement[]> => {
    let path = `/stock/${stockID}/movement`;
    if (date) {
        path += `?date=${date}`;
    }
    const response = await RequestApi<null, StockMovement[]>({
        path,
        method: "GET",
        headers: AddAccessToken(session),
    });

    return response.data
};

export {
    GetMovementsByStockID
}; 