import Employee from "../employee/employee";
import OrderDelivery from "../order/order-delivery";

export default class DeliveryDriver {
    id: string = '';
    employee_id: string = '';
    employee: Employee = new Employee();
    order_deliveries: OrderDelivery[] = [];

    constructor(data: Partial<DeliveryDriver> = {}) {
        Object.assign(this, data);
    }
}