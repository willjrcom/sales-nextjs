import Category from "../category/category";
import Item from "./item";
import Decimal from 'decimal.js';

export type StatusGroupItem = "Staging" | "Pending" | "Started" | "Ready" | "Canceled";


export default class GroupItem {
  id: string = "";
  items: Item[] = [];
  order_id: string = "";
  size: string = "";
  status: StatusGroupItem = "Staging";
  total_price: Decimal = new Decimal(0);
  quantity: number = 0;
  need_print: boolean = false;
  use_process_rule: boolean = false;
  observation: string = "";
  category_id: string = "";
  category?: Category;
  complement_item_id?: string = "";
  complement_item?: Item;
  start_at?: string;
  pending_at?: string;
  started_at?: string;
  ready_at?: string;
  canceled_at?: string;

  constructor(
    id = "",
    items: Item[] = [],
    order_id = "",
    size = "",
    status: StatusGroupItem = "Staging",
    total_price: Decimal = new Decimal(0),
    quantity = 0,
    need_print = false,
    use_process_rule = false,
    observation = "",
    category_id = "",
    complement_item_id = "",
    start_at?: string,
    pending_at?: string,
    started_at?: string,
    ready_at?: string,
    canceled_at?: string
  ) {
    this.id = id;
    this.items = items;
    this.order_id = order_id;
    this.size = size;
    this.status = status;
    this.total_price = total_price;
    this.quantity = quantity;
    this.need_print = need_print;
    this.use_process_rule = use_process_rule;
    this.observation = observation;
    this.category_id = category_id;
    this.complement_item_id = complement_item_id;
    this.start_at = start_at;
    this.pending_at = pending_at;
    this.started_at = started_at;
    this.ready_at = ready_at;
    this.canceled_at = canceled_at;
  }
};