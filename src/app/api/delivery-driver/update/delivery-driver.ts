import RequestApi, { AddAccessToken } from "../../request";
import { Session } from "next-auth";
import DeliveryDriver from "@/app/entities/delivery-driver/delivery-driver";

const UpdateDeliveryDriver = async (driver: DeliveryDriver, session: Session): Promise<string> => {
    const response = await RequestApi<DeliveryDriver, string>({
        path: "/delivery-driver/update/" + driver.id,
        method: "PATCH",
        body: driver,
        headers: AddAccessToken(session),
    });

    return response.data
};

export default UpdateDeliveryDriver