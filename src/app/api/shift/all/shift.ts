import RequestApi, { AddAccessToken, GetAllResponse } from "../../request";
import { Session } from "next-auth";
import Shift from "@/app/entities/shift/shift";

const GetAllShifts = async (session: Session, page?: number, perPage?: number): Promise<GetAllResponse<Shift>> => {
    const response = await RequestApi<null, Shift[]>({
        path: `/shift/all?page=${page}&per_page=${perPage}`, 
        method: "GET",
        headers: AddAccessToken(session),
    });
    return {items: response.data, headers: response.headers}
};

export default GetAllShifts