import Employee from "@/app/entities/employee/employee";
import RequestApi, { AddAccessToken, GetAllResponse } from "../request";
import { Session } from "next-auth";

const GetEmployees = async (session: Session, page?: number, perPage?: number, isActive?: boolean): Promise<GetAllResponse<Employee>> => {
    const response = await RequestApi<null, Employee[]>({
        path: `/employee/all?page=${page}&per_page=${perPage}&is_active=${isActive}`,
        method: "GET",
        headers: AddAccessToken(session),
    });
    return { items: response.data, headers: response.headers }
};

export const GetEmployeesDeleted = async (session: Session, page?: number, perPage?: number): Promise<GetAllResponse<Employee>> => {
    const response = await RequestApi<null, Employee[]>({
        path: `/employee/deleted?page=${page}&per_page=${perPage}`,
        method: "GET",
        headers: AddAccessToken(session),
    });
    return { items: response.data, headers: response.headers }
};

export default GetEmployees