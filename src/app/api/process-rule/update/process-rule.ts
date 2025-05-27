import ProcessRule from "@/app/entities/process-rule/process-rule";
import RequestApi, { AddAccessToken } from "../../request";
import { Session } from "next-auth";

const UpdateProcessRule = async (processRule: ProcessRule, session: Session): Promise<string> => {
    const response = await RequestApi<ProcessRule, string>({
        path: "/product-category/process-rule/update/" + processRule.id, 
        method: "PATCH",
        body: processRule,
        headers: await AddAccessToken(session),
    });

    return response.data
};

export default UpdateProcessRule