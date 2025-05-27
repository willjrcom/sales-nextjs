import Table from "@/app/entities/table/table";
import RequestApi, { AddAccessToken } from "../../request";
import { Session } from "next-auth";

const GetUnusedTables = async (session: Session): Promise<Table[]> => {
    const response = await RequestApi<null, Table[]>({
        path: "/table/all/unused", 
        method: "GET",
        headers: await AddAccessToken(session),
    });
    return response.data
};

export default GetUnusedTables