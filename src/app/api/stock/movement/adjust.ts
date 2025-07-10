import StockMovement from "@/app/entities/stock/stock-movement";
import RequestApi, { AddAccessToken } from "../../request";
import { Session } from "next-auth";

interface AdjustStockRequest {
    movement: StockMovement;
    new_stock: number;
}

const AdjustStock = async (request: AdjustStockRequest, session: Session): Promise<StockMovement> => {
    const response = await RequestApi<AdjustStockRequest, StockMovement>({
        path: "/stock/movement/adjust", 
        method: "POST",
        body: request,
        headers: await AddAccessToken(session),
    });

    return response.data
};

export default AdjustStock 