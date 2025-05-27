import RequestApi, { AddAccessToken } from "../../../request";
import { Session } from "next-auth";
import PlaceTable from "@/app/entities/place/place_table";

const AddTableToPlace = async (placeTable: PlaceTable, session: Session): Promise<string> => {
    const response = await RequestApi<PlaceTable, string>({
        path: "/place/table", 
        method: "POST",
        body: placeTable,
        headers: await AddAccessToken(session),
    });

    return response.data
};

export default AddTableToPlace