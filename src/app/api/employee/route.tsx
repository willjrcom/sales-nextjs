import { Employee } from "@/app/entities/employee/employee";
import RequestApi from "../request";
import { Session } from "next-auth";

const GetEmployees = async (session: Session): Promise<Employee[]> => {
    const response = await RequestApi<null, Employee[]>({
        path: "/employee/all", 
        method: "GET",
        headers: {
            "id-token": session.idToken
        }
    });
    return response.data
};

export default GetEmployees