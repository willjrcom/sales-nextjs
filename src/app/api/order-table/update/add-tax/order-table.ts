import RequestApi, { AddAccessToken } from "@/app/api/request";
import { Session } from "next-auth";

/**
 * Adiciona taxa a um pedido de mesa.
 * Endpoint: PUT /order-table/update/add-tax/{orderTableId}
 */
const AddTableTax = async (
  orderTableId: string,
  session: Session
): Promise<string> => {
  const response = await RequestApi<never, string>({
    path: "/order-table/update/add-tax/" + orderTableId,
    method: "POST",
    headers: await AddAccessToken(session),
  });
  return response.data;
};

export default AddTableTax;