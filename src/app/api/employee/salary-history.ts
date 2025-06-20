import { Session } from "next-auth";
import RequestApi, { AddAccessToken } from "../request";

export async function getEmployeeSalaryHistory(employeeId: string, session: Session) {
    const response = await RequestApi<null, any[]>({
        path: `/employee/${employeeId}/salary-history`,
        method: "GET",
        headers: await AddAccessToken(session),
    });
    return response.data;
} 