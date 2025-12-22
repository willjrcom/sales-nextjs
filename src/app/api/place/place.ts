import Place from "@/app/entities/place/place";
import RequestApi, { AddAccessToken, GetAllResponse } from "../request";
import { Session } from "next-auth";

const GetPlaces = async (session: Session): Promise<GetAllResponse<Place>> => {
    const response = await RequestApi<null, Place[]>({
        path: "/place/all",
        method: "GET",
        headers: AddAccessToken(session),
    });
    return { items: response.data, headers: response.headers }
};

export default GetPlaces