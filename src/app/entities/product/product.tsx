import { z } from "zod";
import Decimal from 'decimal.js';
import Category from "../category/category";
import Size from "../size/size";

export default class Product {
    id: string = '';
    code: string = '';
    image_path: string = '';
    name: string = '';
    description: string = '';
    flavors: string[] = [];
    price: Decimal = new Decimal(0);
    cost: Decimal = new Decimal(0);
    category_id: string = '';
    category: Category = new Category();
    size_id: string = '';
    size: Size = new Size();
    is_available: boolean = true;
    is_active: boolean = true;


    constructor(data: Partial<Product> = {}) {
        Object.assign(this, data);
    }
}

const SchemaProduct = z.object({
    code: z.string().min(1, 'Código precisa ter pelo menos 1 caracteres').max(100, 'Código precisa ter no máximo 100 caracteres'),
    image_path: z.string().optional(),
    name: z.string().min(3, 'Nome precisa ter pelo menos 3 caracteres').max(100, 'Nome precisa ter no máximo 100 caracteres'),
    description: z.string().optional(),
    flavors: z.array(z.string().trim().min(1, 'Sabor inválido')).optional(),
    price: z.coerce.number().optional(),
    cost: z.coerce.number().optional(),
    category_id: z.string().uuid("Categoria inválida"),
    size_id: z.string().uuid("Tamanho inválido"),
    is_available: z.boolean(),
});

export const ValidateProductForm = (product: Product) => {
    const validatedFields = SchemaProduct.safeParse({
        code: product.code,
        name: product.name,
        description: product.description,
        flavors: product.flavors,
        price: new Decimal(product.price).toNumber(),
        cost: new Decimal(product.cost).toNumber(),
        category_id: product.category_id,
        size_id: product.size_id,
        is_available: product.is_available,
    });

    if (!validatedFields.success) {
        // Usa o método flatten para simplificar os erros
        return validatedFields.error.flatten().fieldErrors;
    }
    return {}
};