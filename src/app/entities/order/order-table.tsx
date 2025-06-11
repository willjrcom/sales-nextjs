import Decimal from "decimal.js";
import Table from "../table/table";

type StatusOrderTable = "Staging" | "Pending" | "Closed";

export default class OrderTable {
  id: string = "";
  name: string = "";
  contact: string = "";
  status: StatusOrderTable = "Staging";
  tax_rate: Decimal = new Decimal(0);
  order_id: string = "";
  table_id: string = "";
  table: Table = new Table();
  created_at: string = "";
  pending_at?: string = "";
  closed_at?: string = "";

  constructor(id = "", name = "", contact = "", status: StatusOrderTable = "Staging", tax_rate: Decimal = new Decimal(0), order_id = "", table_id = "", table: Table = new Table(), created_at = "", pending_at = "", closed_at = "") {
    this.id = id;
    this.name = name;
    this.contact = contact;
    this.status = status;
    this.tax_rate = tax_rate;
    this.order_id = order_id;
    this.table_id = table_id;
    this.table = table;
    this.created_at = created_at;
    this.pending_at = pending_at;
    this.closed_at = closed_at;
  }
}