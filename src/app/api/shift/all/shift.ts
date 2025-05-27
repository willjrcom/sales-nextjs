import RequestApi, { AddAccessToken } from "../../request";
import { Session } from "next-auth";
import Shift from "@/app/entities/shift/shift";

const GetAllShifts = async (session: Session): Promise<Shift> => {
    const response = await RequestApi<null, Shift>({
        path: "/shift/all", 
        method: "GET",
        headers: await AddAccessToken(session),
    });
    return response.data
};

export default GetAllShifts