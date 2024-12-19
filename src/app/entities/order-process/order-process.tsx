import GroupItem from "../order/group-item";
import Product from "../product/product";

type StatusProcess = "Pending" | "Started" | "Finished" | "Paused" | "Continued" | "Canceled";

export class OrderProcess {
    id: string = "";
    employee_id?: string = "";  
    group_item_id: string = "";
    group_item?: GroupItem = new GroupItem(); 
    process_rule_id: string = "";
    status: StatusProcess = "Pending";
    products: Product[] = []; 
    started_at?: string = "";
    paused_at?: string = ""; 
    continued_at?: string = "";
    finished_at?: string = "";
    canceled_at?: string = "";
    canceled_reason?: string; 
    duration: number = 0; 
    duration_formatted: string = "";
    total_paused: number = 0; 
}
