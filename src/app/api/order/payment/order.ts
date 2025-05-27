import Order from "@/app/entities/order/order";
import { Session } from "next-auth";
import RequestApi, { AddAccessToken } from "../../request";
import { PaymentOrder } from "@/app/entities/order/order-payment";

const PayOrder = async (payment: PaymentOrder, session: Session): Promise<string> => {
    const response = await RequestApi<PaymentOrder, string>({
        path: "/order/update/" + payment.order_id + "/payment", 
        method: "PUT",
        body: payment,
        headers: await AddAccessToken(session),
    });

    return response.data
};

export default PayOrder