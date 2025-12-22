import Shift from "@/app/entities/shift/shift";
import RequestApi, { AddAccessToken } from "../../request";
import { Session } from "next-auth";

const GetCurrentShift = async (session: Session): Promise<Shift> => {
    const response = await RequestApi<null, Shift>({
        path: "/shift/current", 
        method: "GET",
        headers: AddAccessToken(session),
    });
    return response.data
};

export default GetCurrentShift