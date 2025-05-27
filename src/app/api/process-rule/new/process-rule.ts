import ProcessRule from "@/app/entities/process-rule/process-rule";
import RequestApi, { AddAccessToken } from "../../request";
import { Session } from "next-auth";

const NewProcessRule = async (processRule: ProcessRule, session: Session): Promise<string> => {
    const response = await RequestApi<ProcessRule, string>({
        path: "/product-category/process-rule/new", 
        method: "POST",
        body: processRule,
        headers: await AddAccessToken(session),
    });

    return response.data
};

export default NewProcessRule