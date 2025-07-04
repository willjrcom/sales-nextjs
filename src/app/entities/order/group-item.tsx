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
  printer_name: string = "";
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

  constructor(data: Partial<GroupItem> = {}) {
    Object.assign(this, data);
  }
};