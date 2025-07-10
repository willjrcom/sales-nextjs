import { z } from "zod";
import Decimal from 'decimal.js';
import Product from "../product/product";

export default class StockMovement {
    id: string = "";
    stock_id: string = "";
    product_id: string = "";
    type: string = ""; // 'in', 'out', 'adjust'
    quantity: Decimal = new Decimal(0);
    reason: string = "";
    order_id?: string;
    order_number?: number;
    employee_id?: string;
    employee_name?: string;
    unit_cost: Decimal = new Decimal(0);
    total_cost: Decimal = new Decimal(0);
    notes: string = "";
    created_at: string = "";
    product?: Product;

    constructor(data: Partial<StockMovement> = {}) {
        Object.assign(this, data);
    }
}

const SchemaStockMovement = z.object({
    stock_id: z.string().uuid("Estoque inválido"),
    product_id: z.string().uuid("Produto inválido"),
    type: z.enum(['in', 'out', 'adjust'], { required_error: 'Tipo é obrigatório' }),
    quantity: z.coerce.number().min(0.001, 'Quantidade deve ser maior que 0'),
    reason: z.string().min(1, 'Motivo é obrigatório').max(255, 'Motivo deve ter no máximo 255 caracteres'),
    unit_cost: z.coerce.number().min(0, 'Custo unitário deve ser maior ou igual a 0'),
    notes: z.string().optional(),
});

export const ValidateStockMovementForm = (movement: StockMovement) => {
    const validatedFields = SchemaStockMovement.safeParse({
        stock_id: movement.stock_id,
        product_id: movement.product_id,
        type: movement.type,
        quantity: new Decimal(movement.quantity).toNumber(),
        reason: movement.reason,
        unit_cost: new Decimal(movement.unit_cost).toNumber(),
        notes: movement.notes
    });

    if (!validatedFields.success) {
        return validatedFields.error.flatten().fieldErrors;
    } 
    return {}
}; 