import Table from "@/app/entities/table/table";
import RequestApi, { AddAccessToken, GetAllResponse } from "../request";
import { Session } from "next-auth";

const GetTables = async (session: Session, page: number = 1, perPage: number = 10): Promise<GetAllResponse<Table>> => {
    const response = await RequestApi<null, Table[]>({
        path: `/table/all?page=${page}&per_page=${perPage}`,
        method: "GET",
        headers: await AddAccessToken(session),
    });
    return { items: response.data, headers: response.headers }
};

export default GetTables