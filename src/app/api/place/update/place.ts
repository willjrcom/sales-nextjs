import Place from "@/app/entities/place/place";
import RequestApi, { AddIdToken } from "../../request";
import { Session } from "next-auth";

const UpdatePlace = async (place: Place, session: Session): Promise<string> => {
    const response = await RequestApi<Place, string>({
        path: "/place/update/" + place.id, 
        method: "PATCH",
        body: place,
        headers: await AddIdToken(session),
    });

    return response.data
};

export default UpdatePlace