import Place from "@/app/entities/place/place";
import RequestApi, { AddIdToken } from "../request";
import { Session } from "next-auth";

const GetPlaces = async (session: Session): Promise<Place[]> => {
    const response = await RequestApi<null, Place[]>({
        path: "/place/all", 
        method: "GET",
        headers: await AddIdToken(session),
    });
    return response.data
};

export default GetPlaces