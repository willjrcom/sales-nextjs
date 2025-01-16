import Employee from "@/app/entities/employee/employee";
import RequestApi, { AddIdToken } from "../../request";
import { Session } from "next-auth";

const DeleteEmployee = async (id: string, session: Session): Promise<string> => {
    const response = await RequestApi<string, string>({
        path: "/employee/" + id, 
        method: "DELETE",
        headers: await AddIdToken(session),
    });
    return response.data
};

export default DeleteEmployee