import Shift from "@/app/entities/shift/shift";
import RequestApi, { AddIdToken } from "../../request";
import { Session } from "next-auth";

const GetShiftByID = async (id: string, session: Session): Promise<Shift> => {
    const response = await RequestApi<null, Shift>({
        path: "/shift/" + id, 
        method: "GET",
        headers: await AddIdToken(session),
    });
    return response.data
};

export default GetShiftByID