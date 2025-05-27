import Table from "@/app/entities/table/table";
import RequestApi, { AddAccessToken } from "../../request";
import { Session } from "next-auth";

const NewTable = async (table: Table, session: Session): Promise<string> => {
    const response = await RequestApi<Table, string>({
        path: "/table/new", 
        method: "POST",
        body: table,
        headers: await AddAccessToken(session),
    });

    return response.data
};

export default NewTable