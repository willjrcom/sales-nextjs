import RequestApi, { AddAccessToken } from "../request";
import { Session } from "next-auth";

export interface ProcessRuleOrder {
    id: string;
    order: number;
}

interface ProcessRuleReorderDTO {
    process_rules: ProcessRuleOrder[];
}

export default async function ReorderProcessRules(session: Session, processRules: ProcessRuleOrder[]) {
    const response = await RequestApi<ProcessRuleReorderDTO, any>({
        path: `/product-category/process-rule/reorder`,
        method: "PATCH",
        headers: AddAccessToken(session),
        body: {
            process_rules: processRules
        }
    });

    return response.data;
}
