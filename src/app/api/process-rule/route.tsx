import ProcessRule from "@/app/entities/process-rule/process-rule";
import RequestApi, { AddIdToken } from "../request";
import { Session } from "next-auth";

const GetProcessRulesByCategoryID = async (id: string, session: Session): Promise<ProcessRule[]> => {
    const response = await RequestApi<string, ProcessRule[]>({
        path: "/product-category/process-rule/by-category-id/" + id, 
        method: "GET",
        headers: await AddIdToken(session),
    });

    return response.data
};

export default GetProcessRulesByCategoryID