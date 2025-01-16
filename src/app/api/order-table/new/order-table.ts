import RequestApi, { AddIdToken } from "../../request";
import { Session } from "next-auth";

interface NewOrderProps {
    table_id: string,
    order_id: string
}

const NewOrderTable = async (table_id: string, session: Session): Promise<NewOrderProps> => {
    const response = await RequestApi<Object, NewOrderProps>({
        path: "/order-table/new", 
        method: "POST",
        body: { table_id: table_id },
        headers: await AddIdToken(session),
    });

    return response.data
};

export default NewOrderTable