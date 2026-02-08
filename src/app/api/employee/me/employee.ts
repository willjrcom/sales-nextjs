import Employee from "@/app/entities/employee/employee";
import { Session } from "next-auth";
import RequestApi, { AddAccessToken } from "../../request";

const GetMeEmployee = async (session: Session): Promise<Employee> => {
    const response = await RequestApi<null, Employee>({
        path: `/employee/me`,
        method: "GET",
        headers: AddAccessToken(session),
    });

    return response.data
};

export default GetMeEmployee