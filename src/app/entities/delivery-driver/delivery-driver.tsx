import Employee from "../employee/employee";
import OrderDelivery from "../order/order-delivery";
import { z } from "zod";

export default class DeliveryDriver {
    id: string = '';
    employee_id: string = '';
    is_active: boolean = true;
    employee: Employee = new Employee();
    order_deliveries: OrderDelivery[] = [];

    constructor(data: Partial<DeliveryDriver> = {}) {
        Object.assign(this, data);
    }
}

const SchemaDeliveryDriver = z.object({
    employee_id: z.string().uuid("Funcionário inválido"),
    is_active: z.boolean(),
});

export const ValidateDeliveryDriverForm = (driver: DeliveryDriver) => {
    const validatedFields = SchemaDeliveryDriver.safeParse({
        employee_id: driver.employee_id,
        is_active: driver.is_active
    });

    if (!validatedFields.success) {
        return validatedFields.error.flatten().fieldErrors;
    }
    return {}
};