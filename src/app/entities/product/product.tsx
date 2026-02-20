import { z } from "zod";
import Decimal from 'decimal.js';
import Category from "../category/category";
import ProductVariation from "./variation";

export default class Product {
    id: string = '';
    sku: string = '';
    image_path: string = '';
    name: string = '';
    description: string = '';
    flavors: string[] = [];
    category_id: string = '';
    category: Category = new Category();
    is_active: boolean = true;
    variations: ProductVariation[] = [];

    constructor(data: Partial<Product> = {}) {
        Object.assign(this, data);
        if (data.variations) {
            this.variations = data.variations.map(v => new ProductVariation(v));
        }
    }
}

const SchemaProduct = z.object({
    sku: z.string().min(1, 'SKU precisa ter pelo menos 1 caracteres').max(100, 'Código precisa ter no máximo 100 caracteres'),
    image_path: z.string().optional(),
    name: z.string().min(3, 'Nome precisa ter pelo menos 3 caracteres').max(100, 'Nome precisa ter no máximo 100 caracteres'),
    description: z.string().optional(),
    flavors: z.array(z.string().trim().min(1, 'Sabor inválido')).optional(),
    category_id: z.string().uuid("Categoria inválida"),
    variations: z.array(z.object({
        size_id: z.string().uuid("Tamanho inválido"),
        price: z.coerce.number().min(0, "Preço deve ser maior ou igual a 0"),
        cost: z.coerce.number().min(0, "Custo deve ser maior ou igual a 0"),
        is_available: z.boolean(),
    })).min(1, "Adicione pelo menos uma variação"),
});

export const ValidateProductForm = (product: Product) => {
    const validatedFields = SchemaProduct.safeParse({
        sku: product.sku,
        name: product.name,
        description: product.description,
        flavors: product.flavors,
        category_id: product.category_id,
        variations: product.variations.map(v => ({
            size_id: v.size_id,
            price: new Decimal(v.price).toNumber(),
            cost: new Decimal(v.cost).toNumber(),
            is_available: v.is_available
        }))
    });

    if (!validatedFields.success) {
        // Usa o método flatten para simplificar os erros
        return validatedFields.error.flatten().fieldErrors;
    }
    return {}
};