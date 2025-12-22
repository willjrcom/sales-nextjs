import Shift from "@/app/entities/shift/shift";
import RequestApi, { AddAccessToken } from "../../../request";
import { Session } from "next-auth";

interface AddRedeemProps {
    name: string;
    value: number;
}

const AddRedeemToShift = async (name: string, value: number, session: Session): Promise<Shift> => {
    const body = { name: name, value: value } as AddRedeemProps;
    const response = await RequestApi<AddRedeemProps, Shift>({
        path: "/shift/redeem/add", 
        method: "PUT",
        body: body,
        headers: AddAccessToken(session),
    });
    return response.data
};

export default AddRedeemToShift