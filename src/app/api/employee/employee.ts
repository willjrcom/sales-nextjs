import Employee from "@/app/entities/employee/employee";
import RequestApi, { AddAccessToken, GetAllResponse } from "../request";
import { Session } from "next-auth";

const GetEmployees = async (session: Session, page = 1, perPage = 10): Promise<GetAllResponse<Employee>> => {
    const response = await RequestApi<null, Employee[]>({
        path: `/employee/all?page=${page}&per_page=${perPage}`, 
        method: "GET",
        headers: await AddAccessToken(session),
    });
    return {items: response.data, headers: response.headers}
};

export default GetEmployees