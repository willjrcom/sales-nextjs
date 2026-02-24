import RequestApi, { AddAccessToken } from "@/app/api/request";
import { Session } from "next-auth";

interface UpdateNameProps {
    name: string;
}

const UpdateTableOrderName = async (tableOrderId: string, name: string, session: Session): Promise<string> => {
    const body = { name: name } as UpdateNameProps;

    const response = await RequestApi<UpdateNameProps, string>({
        path: "/order-table/update/name/" + tableOrderId,
        method: "POST",
        body: body,
        headers: AddAccessToken(session),
    });

    return response.data
};

export default UpdateTableOrderName

