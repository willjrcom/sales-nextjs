'use server'

import { Session } from "next-auth"
import RequestApi, { AddAccessToken } from "../request"
import { Sponsor } from "@/app/entities/sponsor/sponsor"

export default async function GetAllSponsors(session: Session): Promise<Sponsor[]> {
    const response = await RequestApi<null, Sponsor[]>({
        path: '/sponsor/all',
        method: 'GET',
        headers: AddAccessToken(session),
    })
    return response.data
}
