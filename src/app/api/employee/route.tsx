import { Employee } from "@/app/entities/employee/employee";
import RequestApi from "../request";

const GetEmployees = async (): Promise<Employee[]> => {
    const response = await RequestApi<null, Employee[]>({path: "/employee/all", method: "GET"});
    return response.data
};

export default GetEmployees