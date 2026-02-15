'use server'

import { Session } from "next-auth"
import RequestApi, { AddAccessToken } from "../request"

export interface CompanyCategory {
    id: string
    name: string
    image_path?: string
}

export default async function GetAllCompanyCategories(session: Session): Promise<CompanyCategory[]> {
    const response = await RequestApi<null, CompanyCategory[]>({
        path: '/company-category/',
        method: 'GET',
        headers: AddAccessToken(session),
    })
    return response.data
}
