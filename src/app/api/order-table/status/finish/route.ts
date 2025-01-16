import RequestApi, { AddIdToken } from "@/app/api/request";
import { Session } from "next-auth";

const CloseTable = async (table_id: string, session: Session): Promise<string> => {
    const response = await RequestApi<null, string>({
        path: "/order-table/update/close/" + table_id, 
        method: "POST",
        headers: await AddIdToken(session),
    });

    return response.data
};

export default CloseTable