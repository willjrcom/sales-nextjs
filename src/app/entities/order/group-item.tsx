import Category from "../category/category";
import { Item } from "./item";

type StatusGroupItem = "Staging" | "Pending" | "Started" | "Ready" | "Canceled";

class GroupItemTimeLogs {
  pending_at?: Date;
  started_at?: Date;
  ready_at?: Date;
  canceled_at?: Date;
};

class GroupDetails extends GroupItemTimeLogs {
  size: string = "";
  status: StatusGroupItem = "Staging";
  total_price: number = 0;
  quantity: number = 0;
  need_print: boolean = false;
  category_id: string = "";
  category?: Category;
  complement_item_id?: string = "";
  complement_item?: Item;
  
  constructor() {
    super();
  }
};

class GroupCommonAttributes extends GroupDetails {
  items: Item[] = [];
  order_id: string = "";

  constructor() {
    super();
  }
};

export default class GroupItem extends GroupCommonAttributes {
  id: string = "";

  constructor() {
    super();
  }
};