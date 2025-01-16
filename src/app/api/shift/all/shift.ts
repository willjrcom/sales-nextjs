import RequestApi, { AddIdToken } from "../../request";
import { Session } from "next-auth";
import Shift from "@/app/entities/shift/shift";

const GetAllShifts = async (session: Session): Promise<Shift> => {
    const response = await RequestApi<null, Shift>({
        path: "/shift/all", 
        method: "GET",
        headers: await AddIdToken(session),
    });
    return response.data
};

export default GetAllShifts