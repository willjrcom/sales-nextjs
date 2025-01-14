import Employee from "../employee/employee";
import Order from "../order/order";

export default class Shift {
    id: string = "";
	current_order_number: number = 0;
    orders: Order[] = [];
    redeems: string[] = [];
    start_change: number = 0;
    end_change: number = 0;
    attendant_id: string = "";
    attendant: Employee = new Employee();
    opened_at: string = "";
    closed_at: string = "";

    constructor(id: string = "", current_order_number: number = 0, orders: Order[] = [], redeems: string[] = [], start_change: number = 0, end_change: number = 0, attendant_id: string = "", attendant: Employee = new Employee(), opened_at: string = "", closed_at: string = "") {
        this.id = id;
        this.current_order_number = current_order_number;
        this.orders = orders;
        this.redeems = redeems;
        this.start_change = start_change;
        this.end_change = end_change;
        this.attendant_id = attendant_id;
        this.attendant = attendant;
        this.opened_at = opened_at;
        this.closed_at = closed_at;
    }
}
