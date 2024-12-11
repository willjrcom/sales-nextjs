import RequestApi, { AddIdToken } from "../../request";
import { Session } from "next-auth";

const NewDeliveryDriver = async (employee_id: string, session: Session): Promise<string> => {
    const response = await RequestApi<Object, string>({
        path: "/delivery-driver/new", 
        method: "POST",
        body: { employee_id: employee_id },
        headers: await AddIdToken(session),
    });

    return response.data
};

export default NewDeliveryDriver