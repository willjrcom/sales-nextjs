import Employee from "@/app/entities/employee/employee";
import RequestApi, { AddIdToken } from "../request";
import { Session } from "next-auth";

const GetEmployees = async (session: Session): Promise<Employee[]> => {
    const response = await RequestApi<null, Employee[]>({
        path: "/employee/all", 
        method: "GET",
        headers: await AddIdToken(session),
    });
    return response.data
};

export default GetEmployees