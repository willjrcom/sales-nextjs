import Decimal from "decimal.js";
import Table from "../table/table";

type StatusOrderTable = "Staging" | "Pending" | "Closed" | "Cancelled";

export default class OrderTable {
  id: string = '';
  name: string = '';
  contact: string = '';
  status: StatusOrderTable = "Staging";
  tax_rate: Decimal = new Decimal(0);
  order_id: string = '';
  table_id: string = '';
  table: Table = new Table();
  created_at: string = '';
  pending_at?: string = '';
  closed_at?: string = '';
  order_number: number = 0;
  cancelled_at?: string = '';


  constructor(data: Partial<OrderTable> = {}) {
    Object.assign(this, data);
  }
}