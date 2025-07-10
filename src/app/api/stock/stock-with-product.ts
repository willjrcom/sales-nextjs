import Stock from "@/app/entities/stock/stock";
import RequestApi, { AddAccessToken } from "../request";
import { Session } from "next-auth";

const GetAllStocksWithProduct = async (session: Session): Promise<Stock[]> => {
    const response = await RequestApi<null, Stock[]>({
        path: "/stock/all/with-product", 
        method: "GET",
        headers: await AddAccessToken(session),
    });

    return response.data
};

const GetStockWithProduct = async (id: string, session: Session): Promise<Stock> => {
    const response = await RequestApi<null, Stock>({
        path: `/stock/${id}/with-product`, 
        method: "GET",
        headers: await AddAccessToken(session),
    });

    return response.data
};

export {
    GetAllStocksWithProduct,
    GetStockWithProduct
}; 