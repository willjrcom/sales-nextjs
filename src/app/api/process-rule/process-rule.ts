import ProcessRule from "@/app/entities/process-rule/process-rule";
import RequestApi, { AddAccessToken, GetAllResponse } from "../request";
import { Session } from "next-auth";

const GetProcessRules = async (session: Session, isActive: boolean): Promise<GetAllResponse<ProcessRule>> => {
    const response = await RequestApi<null, ProcessRule[]>({
        path: `/product-category/process-rule/all?is_active=${isActive}`,
        method: "GET",
        headers: AddAccessToken(session),
    });

    return { items: response.data, headers: response.headers }
};

export default GetProcessRules