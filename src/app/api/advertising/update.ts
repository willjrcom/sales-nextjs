'use server'

import { Session } from "next-auth"
import RequestApi, { AddAccessToken } from "../request"
import { Advertising, AdvertisingFormData } from "@/app/entities/advertising/advertising"

export default async function UpdateAdvertising(ad: Advertising, session: Session): Promise<Advertising> {
    const response = await RequestApi<AdvertisingFormData, Advertising>({
        path: `/advertising/update/${ad.id}`,
        method: 'PUT',
        headers: AddAccessToken(session),
        body: ad
    })
    return response.data
}
