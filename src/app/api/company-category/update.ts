'use server'

import { Session } from "next-auth"
import RequestApi, { AddAccessToken } from "../request"
import { CompanyCategory } from "@/app/entities/company/company-category"

export default async function UpdateCompanyCategory(category: CompanyCategory, session: Session): Promise<CompanyCategory> {
    const response = await RequestApi<CompanyCategory, CompanyCategory>({
        path: `/company-category/${category.id}`,
        method: 'PUT',
        body: category,
        headers: AddAccessToken(session),
    })
    return response.data
}
