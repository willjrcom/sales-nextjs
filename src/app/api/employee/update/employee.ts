import Employee from "@/app/entities/employee/employee";
import RequestApi, { AddAccessToken } from "../../request";
import { Session } from "next-auth";

const UpdateEmployee = async (employee: Employee, session: Session): Promise<string> => {
    const response = await RequestApi<Employee, string>({
        path: "/employee/update/" + employee.id, 
        method: "PATCH",
        body: employee,
        headers: AddAccessToken(session),
    });
    return response.data
};

export default UpdateEmployee