type StatusOrderTable = "Staging" | "Pending" | "Closed";
type Timestamp = string | null;

interface OrderTableCommonAttributes {
  name: string;
  contact: string;
  status: StatusOrderTable;
  order_id: string;
  table_id: string;
}

interface OrderTableTimeLogs {
  pending_at?: Timestamp;
  closed_at?: Timestamp;
}

export interface OrderTable extends OrderTableCommonAttributes, OrderTableTimeLogs {
  id: string;
}