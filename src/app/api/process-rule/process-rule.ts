import ProcessRule from "@/app/entities/process-rule/process-rule";
import RequestApi, { AddAccessToken } from "../request";
import { Session } from "next-auth";

const GetProcessRules = async (session: Session): Promise<ProcessRule[]> => {
    const response = await RequestApi<null, ProcessRule[]>({
        path: "/product-category/process-rule/all", 
        method: "GET",
        headers: AddAccessToken(session),
    });

    return response.data
};

export default GetProcessRules