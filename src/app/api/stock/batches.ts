import StockBatch from "@/app/entities/stock/stock-batch";
import RequestApi, { AddAccessToken } from "../request";
import { Session } from "next-auth";

const GetBatchesByStockID = async (stockID: string, session: Session): Promise<StockBatch[]> => {
    const response = await RequestApi<null, StockBatch[]>({
        path: `/stock/${stockID}/batches`,
        method: "GET",
        headers: AddAccessToken(session),
    });

    return response.data;
};

const GetExpiryAlerts = async (session: Session): Promise<StockBatch[]> => {
    const response = await RequestApi<null, StockBatch[]>({
        path: `/stock/alerts/expiry`,
        method: "GET",
        headers: AddAccessToken(session),
    });

    return response.data;
};

export { GetBatchesByStockID, GetExpiryAlerts };
