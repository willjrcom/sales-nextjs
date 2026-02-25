import { z } from "zod";

type StatusOrderPickup = "Staging" | "Pending" | "Ready" | "Delivered" | "Cancelled";

export default class OrderPickup {
    id: string = '';
    name: string = '';
    contact: string = '';
    status: StatusOrderPickup = "Staging";
    orderId: string = '';
    order_number: number = 0;
    pending_at?: string = '';
    ready_at?: string = '';
    delivered_at?: string = '';
    cancelled_at?: string = '';


    constructor(data: Partial<OrderPickup> = {}) {
        Object.assign(this, data);
    }
}

export const SchemaUpdatePickupName = z.object({
    name: z.string().min(3, 'O nome deve ter no mínimo 3 caracteres'),
});

export type UpdatePickupNameFormData = z.infer<typeof SchemaUpdatePickupName>;