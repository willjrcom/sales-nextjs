'use server'

import { Session } from "next-auth"
import RequestApi, { AddAccessToken } from "../request"

export default async function DeleteAdvertising(id: string, session: Session): Promise<void> {
    await RequestApi<null, void>({
        path: `/advertising/delete/${id}`,
        method: 'DELETE',
        headers: AddAccessToken(session),
    })
}
