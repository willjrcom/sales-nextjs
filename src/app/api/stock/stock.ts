import Stock from "@/app/entities/stock/stock";
import { StockReportComplete } from "@/app/entities/stock/stock-report";
import RequestApi, { AddAccessToken, GetAllResponse } from "../request";
import { Session } from "next-auth";

const GetAllStocks = async (session: Session): Promise<GetAllResponse<Stock>> => {
    const response = await RequestApi<null, GetAllResponse<Stock>>({
        path: "/stock/all",
        method: "GET",
        headers: await AddAccessToken(session),
    });

    return response.data
};

const GetAllStocksWithProduct = async (session: Session, page?: number, perPage?: number): Promise<GetAllResponse<Stock>> => {
    const response = await RequestApi<null, GetAllResponse<Stock>>({
        path: "/stock/all/with-product",
        method: "GET",
        headers: await AddAccessToken(session),
    });

    return response.data
};

const GetStockByID = async (id: string, session: Session): Promise<Stock> => {
    const response = await RequestApi<null, Stock>({
        path: `/stock/${id}`,
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

const GetStockByProductID = async (productID: string, session: Session): Promise<Stock> => {
    const response = await RequestApi<null, Stock>({
        path: `/stock/product/${productID}`,
        method: "GET",
        headers: await AddAccessToken(session),
    });

    return response.data
};

const GetLowStockProducts = async (session: Session, page?: number, perPage?: number): Promise<GetAllResponse<Stock>> => {
    const response = await RequestApi<null, GetAllResponse<Stock>>({
        path: "/stock/low-stock",
        method: "GET",
        headers: await AddAccessToken(session),
    });

    return response.data
};

const GetOutOfStockProducts = async (session: Session, page?: number, perPage?: number): Promise<GetAllResponse<Stock>> => {
    const response = await RequestApi<null, GetAllResponse<Stock>>({
        path: "/stock/out-of-stock",
        method: "GET",
        headers: await AddAccessToken(session),
    });

    return response.data
};

const GetStockReport = async (session: Session, page?: number, perPage?: number): Promise<GetAllResponse<StockReportComplete>> => {
    const response = await RequestApi<null, GetAllResponse<StockReportComplete>>({
        path: "/stock/report",
        method: "GET",
        headers: await AddAccessToken(session),
    });

    return response.data
};

export {
    GetAllStocks,
    GetAllStocksWithProduct,
    GetStockByID,
    GetStockWithProduct,
    GetStockByProductID,
    GetLowStockProducts,
    GetOutOfStockProducts,
    GetStockReport
}; 