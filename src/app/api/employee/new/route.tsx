import { Employee } from "@/app/entities/employee/employee";
import RequestApi from "../../request";

const NewEmployee = async (): Promise<string> => {
    const response = await RequestApi<Employee, string>({path: "/employee/all", method: "GET"});
    return response.data
};

export default NewEmployee