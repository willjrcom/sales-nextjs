import Table from "@/app/entities/table/table";
import RequestApi, { AddAccessToken, GetAllResponse } from "../../request";
import { Session } from "next-auth";

const GetUnusedTables = async (session: Session): Promise<GetAllResponse<Table>> => {
    const response = await RequestApi<null, Table[]>({
        path: "/table/all/unused",
        method: "GET",
        headers: AddAccessToken(session),
    });
    return { items: response.data, headers: response.headers }
};

export default GetUnusedTables