import RequestApi, { AddAccessToken } from "../../request";
import { Session } from "next-auth";

interface NewOrderProps {
    table_id: string,
    order_id: string
}

const NewOrderTable = async (session: Session, table_id: string, name?: string, contact?: string): Promise<NewOrderProps> => {
    const response = await RequestApi<Object, NewOrderProps>({
        path: "/order-table/new",
        method: "POST",
        body: { table_id: table_id, name: name, contact: contact },
        headers: AddAccessToken(session),
    });

    return response.data
};

export default NewOrderTable