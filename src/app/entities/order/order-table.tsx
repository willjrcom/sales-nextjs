type StatusOrderTable = "Staging" | "Pending" | "Closed";
type Timestamp = string | null;

export default class OrderTable {
  id: string = "";
  name: string = "";
  contact: string = "";
  status: StatusOrderTable = "Staging";
  order_id: string = "";
  table_id: string = "";
  pending_at?: Timestamp = "";
  closed_at?: Timestamp = "";
}