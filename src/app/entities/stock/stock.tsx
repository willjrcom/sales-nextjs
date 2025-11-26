import { z } from "zod";
import Decimal from 'decimal.js';
import Product from "../product/product";

export default class Stock {
    id: string = '';
    product_id: string = '';
    current_stock: Decimal = new Decimal(0);
    min_stock: Decimal = new Decimal(0);
    max_stock: Decimal = new Decimal(1000);
    unit: string = '';
    is_active: boolean = true;
    created_at: string = '';
    updated_at: string = '';
    product?: Product;

    constructor(data: Partial<Stock> = {}) {
        Object.assign(this, data);
    }
}

const SchemaStock = z.object({
    product_id: z.string().uuid("Produto inválido"),
    current_stock: z.coerce.number().min(0, 'Estoque atual deve ser maior ou igual a 0'),
    min_stock: z.coerce.number().min(0, 'Estoque mínimo deve ser maior ou igual a 0'),
    max_stock: z.coerce.number().min(0, 'Estoque máximo deve ser maior ou igual a 0'),
    unit: z.string().min(1, 'Unidade é obrigatória').max(20, 'Unidade deve ter no máximo 20 caracteres'),
    is_active: z.boolean(),
});

export const ValidateStockForm = (stock: Stock) => {
    const validatedFields = SchemaStock.safeParse({
        product_id: stock.product_id,
        current_stock: new Decimal(stock.current_stock).toNumber(),
        min_stock: new Decimal(stock.min_stock).toNumber(),
        max_stock: new Decimal(stock.max_stock).toNumber(),
        unit: stock.unit,
        is_active: stock.is_active
    });

    if (!validatedFields.success) {
        return validatedFields.error.flatten().fieldErrors;
    } 
    return {}
}; 