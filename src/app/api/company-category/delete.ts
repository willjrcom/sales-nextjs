'use server'

import { Session } from "next-auth"
import RequestApi, { AddAccessToken } from "../request"

export default async function DeleteCompanyCategory(id: string, session: Session): Promise<void> {
    await RequestApi<null, null>({
        path: `/company-category/${id}`,
        method: 'DELETE',
        headers: AddAccessToken(session),
    })
}
