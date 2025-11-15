import StockMovement from "@/app/entities/stock/stock-movement";
import RequestApi, { AddAccessToken } from "../../request";
import { Session } from "next-auth";
import Decimal from "decimal.js";

export interface RemoveStockRequest {
    id: string;
    new_stock: number;
    reason: string;
    employee_id: string;
    quantity: Decimal;
    price: Decimal;
    total_price: Decimal;
}

const RemoveStock = async (id: string, movement: RemoveStockRequest, session: Session): Promise<StockMovement> => {
    const response = await RequestApi<RemoveStockRequest, StockMovement>({
        path: "/stock/"+id+"/movement/remove", 
        method: "POST",
        body: movement,
        headers: await AddAccessToken(session),
    });

    return response.data
};

export default RemoveStock 