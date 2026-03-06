import RequestApi, { AddAccessToken } from "../../request";
import { Session } from "next-auth";

const DeleteStock = async (id: string, session: Session): Promise<void> => {
    await RequestApi<void, void>({
        path: `/stock/delete/${id}`,
        method: "DELETE",
        headers: AddAccessToken(session),
    });
};

export default DeleteStock 
