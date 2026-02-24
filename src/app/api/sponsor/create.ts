'use server'

import { Session } from "next-auth"
import RequestApi, { AddAccessToken } from "../request"
import { Sponsor, SponsorFormData } from "@/app/entities/sponsor/sponsor"

export default async function CreateSponsor(sponsor: SponsorFormData, session: Session): Promise<Sponsor> {
    const response = await RequestApi<any, Sponsor>({
        path: '/sponsor/create',
        method: 'POST',
        headers: AddAccessToken(session),
        body: sponsor
    })
    return response.data
}
