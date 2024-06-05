import Employee from "@/app/entities/employee/employee";
import RequestApi, { AddIdToken } from "../../request";
import { Session } from "next-auth";

const UpdateEmployee = async (employee: Employee, session: Session): Promise<string> => {
    const response = await RequestApi<Employee, string>({
        path: "/employee/update/" + employee.id, 
        method: "POST",
        body: employee,
        headers: await AddIdToken(session),
    });
    return response.data
};

export default UpdateEmployee