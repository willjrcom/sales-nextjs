'use server'

import { Session } from "next-auth"
import RequestApi, { AddAccessToken } from "../request"
import { Advertising } from "@/app/entities/advertising/advertising"

export default async function GetActiveAdvertisements(session: Session): Promise<Advertising[]> {
    const response = await RequestApi<null, Advertising[]>({
        path: '/advertising/active',
        method: 'GET',
        headers: AddAccessToken(session),
    })
    return response.data
}
