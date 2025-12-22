import RequestApi, { AddAccessToken } from "@/app/api/request";
import { Session } from "next-auth";

/**
 * Remove taxa de um pedido de mesa.
 * Endpoint: PUT /order-table/update/remove-tax/{orderTableId}
 */
const RemoveTableTax = async (
  orderTableId: string,
  session: Session
): Promise<string> => {
  const response = await RequestApi<never, string>({
    path: "/order-table/update/remove-tax/" + orderTableId,
    method: "POST",
    headers: AddAccessToken(session),
  });
  return response.data;
};

export default RemoveTableTax;