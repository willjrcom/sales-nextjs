import StockMovement from "@/app/entities/stock/stock-movement";
import RequestApi, { AddAccessToken } from "../../request";
import { Session } from "next-auth";

const RemoveStock = async (movement: StockMovement, session: Session): Promise<StockMovement> => {
    const response = await RequestApi<StockMovement, StockMovement>({
        path: "/stock/movement/remove", 
        method: "POST",
        body: movement,
        headers: await AddAccessToken(session),
    });

    return response.data
};

export default RemoveStock 