type StatusOrderTable = "Staging" | "Pending" | "Closed";

export default class OrderTable {
  id: string = "";
  name: string = "";
  contact: string = "";
  status: StatusOrderTable = "Staging";
  order_id: string = "";
  table_id: string = "";
  pending_at?: string = "";
  closed_at?: string = "";

  constructor(id = "", name = "", contact = "", status: StatusOrderTable = "Staging", order_id = "", table_id = "", pending_at = "", closed_at = "") {
    this.id = id;
    this.name = name;
    this.contact = contact;
    this.status = status;
    this.order_id = order_id;
    this.table_id = table_id;
    this.pending_at = pending_at;
    this.closed_at = closed_at;
  }
}