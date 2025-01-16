import Employee from "@/app/entities/employee/employee";
import RequestApi, { AddIdToken } from "../../request";
import { Session } from "next-auth";

interface NewEmployeeProps {
    user_id: string;
}
const NewEmployee = async (user_id: string, session: Session): Promise<string> => {
    const body = {user_id};
    const response = await RequestApi<NewEmployeeProps, string>({
        path: "/employee/new", 
        method: "POST",
        body: body,
        headers: await AddIdToken(session),
    });
    return response.data
};

export default NewEmployee