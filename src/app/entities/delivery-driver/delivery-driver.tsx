import Employee from "../employee/employee";
import OrderDelivery from "../order/order-delivery";

export default class DeliveryDriver {
    id: string = "";
    employee_id: string = "";
    employee: Employee = new Employee();
    order_deliveries: OrderDelivery[] = [];

    constructor(id: string = "", employee_id: string = "", employee: Employee = new Employee(), order_deliveries: OrderDelivery[] = []) {
        this.id = id;
        this.employee_id = employee_id;
        this.employee = employee;
        this.order_deliveries = order_deliveries;
    }
}