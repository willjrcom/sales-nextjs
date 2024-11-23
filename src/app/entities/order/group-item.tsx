import Category from "../category/category";
import { Item } from "./item";

export interface GroupItem extends GroupCommonAttributes {
    id: string;
  };
  
  interface GroupCommonAttributes extends GroupDetails {
    group_item_time_logs: GroupItemTimeLogs;
    items: Item[];
    order_id: string;
  };
  
  interface GroupDetails {
    size: string;
    status: StatusGroupItem;
    total_price: number;
    quantity: number;
    need_print: boolean;
    category_id: string;
    category?: Category;
    complement_item_id?: string;
    complement_item?: Item;
  };
  
  type GroupItemTimeLogs = {
    pending_at?: Date;
    started_at?: Date;
    ready_at?: Date;
    canceled_at?: Date;
  };
  

type StatusGroupItem = "Staging" | "Pending" | "Started" | "Ready" | "Canceled";