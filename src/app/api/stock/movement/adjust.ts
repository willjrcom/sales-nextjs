import StockMovement from "@/app/entities/stock/stock-movement";
import RequestApi, { AddAccessToken } from "../../request";
import { Session } from "next-auth";

export interface AdjustStockRequest {
    id: string;
    new_stock: number;
    reason: string;
    employee_id: string;
}

const AdjustStock = async (id: string, request: AdjustStockRequest, session: Session): Promise<StockMovement> => {
    const response = await RequestApi<AdjustStockRequest, StockMovement>({
        path: "/stock/"+id+"/movement/adjust", 
        method: "POST",
        body: request,
        headers: AddAccessToken(session),
    });

    return response.data
};

export default AdjustStock 