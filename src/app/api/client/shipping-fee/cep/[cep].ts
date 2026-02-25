import { Session } from "next-auth";
import RequestApi, { AddAccessToken } from "../../../request";

const GetShippingFeeByCEP = async (cep: string, session: Session): Promise<number> => {
    const response = await RequestApi<null, number>({
        path: "/client/shipping-fee/cep/" + cep.replace("-", ""),
        method: "GET",
        headers: AddAccessToken(session),
    });
    return response.data
};

export default GetShippingFeeByCEP;
