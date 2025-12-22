import { Session } from "next-auth";
import RequestApi, { AddAccessToken } from "../request";

export async function getEmployeePayments(employeeId: string, session: Session) {
    const response = await RequestApi<null, any[]>({
        path: `/employee/${employeeId}/payments`,
        method: "GET",
        headers: AddAccessToken(session),
    });
    return response.data;
}

export async function createEmployeePayment(employeeId: string, data: any, session: Session) {
    const response = await RequestApi<any, any>({
        path: `/employee/${employeeId}/payments`,
        method: "POST",
        body: data,
        headers: AddAccessToken(session),
    });
    return response.data;
} 