'use server'

import { Session } from "next-auth"
import RequestApi, { AddAccessToken } from "../request"
import { Advertising, AdvertisingFormData } from "@/app/entities/advertising/advertising"

export default async function CreateAdvertising(ad: AdvertisingFormData, session: Session): Promise<Advertising> {
    const response = await RequestApi<AdvertisingFormData, Advertising>({
        path: '/advertising/create',
        method: 'POST',
        headers: AddAccessToken(session),
        body: ad
    })
    return response.data
}
