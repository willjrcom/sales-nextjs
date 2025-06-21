import RequestApi, { AddAccessToken } from "../../../request";
import { Session } from "next-auth";

interface ChangeTableProps {
    table_id: string; // UUID como string
    force_update: boolean
}
const ChangeTable = async (orderTableId: string, tableID: string, session: Session): Promise<string> => {
    const changeTable: ChangeTableProps = {
        table_id: tableID,
        force_update: true
    }

    const response = await RequestApi<ChangeTableProps, string>({
        path: "/order-table/update/change-table/" + orderTableId, 
        method: "POST",
        body: changeTable,
        headers: await AddAccessToken(session),
    });

    return response.data
};

export default ChangeTable