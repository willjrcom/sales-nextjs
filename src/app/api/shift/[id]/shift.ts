import Shift from "@/app/entities/shift/shift";
import RequestApi, { AddAccessToken } from "../../request";
import { Session } from "next-auth";

const GetShiftByID = async (id: string, session: Session): Promise<Shift> => {
    const response = await RequestApi<null, Shift>({
        path: "/shift/" + id, 
        method: "GET",
        headers: await AddAccessToken(session),
    });
    return response.data
};

export default GetShiftByID