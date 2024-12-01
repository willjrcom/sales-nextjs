import Category from "../category/category";
import Item from "./item";

export type StatusGroupItem = "Staging" | "Pending" | "Started" | "Ready" | "Canceled";


export default class GroupItem {
  id: string = "";
  items: Item[] = [];
  order_id: string = "";
  size: string = "";
  status: StatusGroupItem = "Staging";
  total_price: number = 0;
  quantity: number = 0;
  need_print: boolean = false;
  category_id: string = "";
  category?: Category;
  complement_item_id?: string = "";
  complement_item?: Item;
  start_at?: Date;
  pending_at?: Date;
  started_at?: Date;
  ready_at?: Date;
  canceled_at?: Date;

  constructor(id = "", items: Item[] = [], order_id = "", size = "", status: StatusGroupItem = "Staging", total_price = 0, quantity = 0, need_print = false, category_id = "", complement_item_id = "", start_at?: Date, pending_at?: Date, started_at?: Date, ready_at?: Date, canceled_at?: Date) {
    this.id = id;
    this.items = items;
    this.order_id = order_id;
    this.size = size;
    this.status = status;
    this.total_price = total_price;
    this.quantity = quantity;
    this.need_print = need_print;
    this.category_id = category_id;
    this.complement_item_id = complement_item_id;
    this.start_at = start_at;
    this.pending_at = pending_at;
    this.started_at = started_at;
    this.ready_at = ready_at;
    this.canceled_at = canceled_at;
  }
};