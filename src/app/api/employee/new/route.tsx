import { Employee } from "@/app/entities/employee/employee";
import RequestApi from "../../request";
import { Session } from "next-auth";

const NewEmployee = async (session: Session): Promise<string> => {
    const response = await RequestApi<Employee, string>({
        path: "/employee/all", 
        method: "GET",
        headers: {
            "id-token": session.idToken
        }
    });
    return response.data
};

export default NewEmployee