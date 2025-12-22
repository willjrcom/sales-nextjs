import Table from "@/app/entities/table/table";
import RequestApi, { AddAccessToken } from "../../request";
import { Session } from "next-auth";

const UpdateTable = async (table: Table, session: Session): Promise<string> => {
    const response = await RequestApi<Table, string>({
        path: "/table/update/" + table.id, 
        method: "PATCH",
        body: table,
        headers: AddAccessToken(session),
    });

    return response.data
};

export default UpdateTable