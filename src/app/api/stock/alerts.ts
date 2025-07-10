import StockAlert from "@/app/entities/stock/stock-alert";
import RequestApi, { AddAccessToken } from "../request";
import { Session } from "next-auth";

const GetAllAlerts = async (session: Session): Promise<StockAlert[]> => {
    const response = await RequestApi<null, StockAlert[]>({
        path: "/stock/alerts", 
        method: "GET",
        headers: await AddAccessToken(session),
    });

    return response.data
};

const GetAlertByID = async (id: string, session: Session): Promise<StockAlert> => {
    const response = await RequestApi<null, StockAlert>({
        path: `/stock/alerts/${id}`, 
        method: "GET",
        headers: await AddAccessToken(session),
    });

    return response.data
};

const ResolveAlert = async (id: string, session: Session): Promise<void> => {
    await RequestApi<null, void>({
        path: `/stock/alerts/${id}/resolve`, 
        method: "PUT",
        headers: await AddAccessToken(session),
    });
};

const DeleteAlert = async (id: string, session: Session): Promise<void> => {
    await RequestApi<null, void>({
        path: `/stock/alerts/${id}`, 
        method: "DELETE",
        headers: await AddAccessToken(session),
    });
};

export {
    GetAllAlerts,
    GetAlertByID,
    ResolveAlert,
    DeleteAlert
}; 