import Place from "@/app/entities/place/place";
import RequestApi, { AddAccessToken } from "../../request";
import { Session } from "next-auth";

const NewPlace = async (place: Place, session: Session): Promise<string> => {
    const response = await RequestApi<Place, string>({
        path: "/place/new", 
        method: "POST",
        body: place,
        headers: AddAccessToken(session),
    });

    return response.data
};

export default NewPlace