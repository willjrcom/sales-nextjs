import RequestApi, { AddAccessToken } from "@/app/api/request";
import { Session } from "next-auth";
import { FiscalSettingsDTO, FiscalSettingsUpdateDTO } from "@/app/entities/fiscal/fiscal-settings";

export { type FiscalSettingsDTO, type FiscalSettingsUpdateDTO };

export async function getFiscalSettings(session: Session): Promise<FiscalSettingsDTO> {
    const response = await RequestApi<unknown, FiscalSettingsDTO>({
        path: `/company/fiscal-settings`,
        method: "GET",
        headers: AddAccessToken(session),
    });

    return response.data;
}

export async function updateFiscalSettings(session: Session, data: FiscalSettingsUpdateDTO): Promise<void> {
    const response = await RequestApi<FiscalSettingsUpdateDTO, void>({
        path: `/company/fiscal-settings`,
        method: "PATCH",
        headers: AddAccessToken(session),
        body: data,
    });

    return response.data;
}
