import Employee from "@/app/entities/employee/employee";
import RequestApi, { AddAccessToken } from "../../request";
import { Session } from "next-auth";

const DeleteEmployee = async (id: string, session: Session): Promise<string> => {
    const response = await RequestApi<string, string>({
        path: "/employee/" + id, 
        method: "DELETE",
        headers: AddAccessToken(session),
    });
    return response.data
};

export default DeleteEmployee