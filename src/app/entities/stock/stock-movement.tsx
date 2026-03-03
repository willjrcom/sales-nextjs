import { z } from "zod";
import Decimal from 'decimal.js';
import Product from "../product/product";

export default class StockMovement {
    id: string = '';
    stock_id: string = '';
    type: string = ''; // 'in', 'out', 'adjust_in', 'adjust_out'
    quantity: Decimal = new Decimal(0);
    reason: string = '';
    order_id?: string;
    employee_id?: string;
    price: Decimal = new Decimal(0);
    created_at: string = '';
    product?: Product;

    constructor(data: Partial<StockMovement> = {}) {
        Object.assign(this, data);
    }
}

export const SchemaAddStockMovement = z.object({
    quantity: z.coerce.number().gt(0, 'Quantidade deve ser maior que 0'),
    reason: z.string().min(1, 'Motivo é obrigatório').max(255, 'Motivo deve ter no máximo 255 caracteres'),
    price: z.coerce.number().gt(0, 'Custo unitário deve ser maior que 0'),
    expires_at: z.string().optional(),
});

export type AddStockMovementFormData = z.infer<typeof SchemaAddStockMovement>;

export const SchemaAdjustStockMovement = z.object({
    new_stock: z.coerce.number().min(0, 'Novo estoque deve ser maior ou igual a 0'),
    reason: z.string().min(1, 'Motivo é obrigatório').max(255, 'Motivo deve ter no máximo 255 caracteres'),
});

export type AdjustStockMovementFormData = z.infer<typeof SchemaAdjustStockMovement>;

export const SchemaRemoveStockMovement = z.object({
    quantity: z.coerce.number().gt(0, 'Quantidade deve ser maior que 0'),
    reason: z.string().min(1, 'Motivo é obrigatório').max(255, 'Motivo deve ter no máximo 255 caracteres'),
});

export type RemoveStockMovementFormData = z.infer<typeof SchemaRemoveStockMovement>;
