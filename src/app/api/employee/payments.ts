import { Session } from "next-auth";
import RequestApi, { AddAccessToken } from "../request";

export async function getEmployeePayments(employeeId: string, session: Session) {
    const response = await RequestApi<null, any[]>({
        path: `/employee/${employeeId}/payments`,
        method: "GET",
        headers: await AddAccessToken(session),
    });
    return response.data;
} 