import Table from "@/app/entities/table/table";
import RequestApi, { AddIdToken } from "../request";
import { Session } from "next-auth";

const GetTables = async (session: Session): Promise<Table[]> => {
    const response = await RequestApi<null, Table[]>({
        path: "/table/all", 
        method: "GET",
        headers: await AddIdToken(session),
    });
    return response.data
};

export default GetTables