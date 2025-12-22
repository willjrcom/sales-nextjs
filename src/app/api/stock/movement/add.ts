import StockMovement from "@/app/entities/stock/stock-movement";
import RequestApi, { AddAccessToken } from "../../request";
import { Session } from "next-auth";
import Decimal from "decimal.js";

export interface AddStockRequest {
    id: string;
    new_stock: number;
    reason: string;
    employee_id: string;
    quantity: Decimal;
    price: Decimal;
    total_price: Decimal;
}

const AddStock = async (id: string, movement: AddStockRequest, session: Session): Promise<StockMovement> => {
    const response = await RequestApi<AddStockRequest, StockMovement>({
        path: "/stock/"+id+"/movement/add", 
        method: "POST",
        body: movement,
        headers: AddAccessToken(session),
    });

    return response.data
};

export default AddStock 