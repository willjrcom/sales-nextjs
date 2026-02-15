'use server'

import { Session } from "next-auth"
import RequestApi, { AddAccessToken } from "../request"
import { CompanyCategory } from "@/app/entities/company/company-category"



export default async function GetAllCompanyCategories(session: Session): Promise<CompanyCategory[]> {
    const response = await RequestApi<null, CompanyCategory[]>({
        path: '/company-category/',
        method: 'GET',
        headers: AddAccessToken(session),
    })
    return response.data
}
