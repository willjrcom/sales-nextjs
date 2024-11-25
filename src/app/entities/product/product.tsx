import { z } from "zod";
import Category from "../category/category";
import Size from "../size/size";

export default class Product {
    id: string = "";
    code: string = "";
    image_path: string = "";
    name: string = "";
    description: string = "";
    price: number = 0;
    cost: number = 0;
    category_id: string = "";
    category: Category = new Category();
    size_id: string = "";
    size: Size = new Size();
    is_available: boolean = false;

    constructor() {}
}

const SchemaProduct = z.object({
    code: z.string().max(100, 'Código precisa ter no máximo 100 caracteres'),
    image_path: z.string().optional(),
    name: z.string().min(3, 'Nome precisa ter pelo menos 3 caracteres').max(100, 'Nome precisa ter no máximo 100 caracteres'),
    description: z.string().optional(),
    price: z.number().min(1, 'Preço inválido'),
    cost: z.number().optional(),
    category_id: z.string().uuid("Categoria inválida"),
    size_id: z.string().uuid("Tamanho inválido"),
    is_available: z.boolean(),
});

export const ValidateProductForm = (product: Product) => {
    const validatedFields = SchemaProduct.safeParse({
        code: product.code,
        image_path: product.image_path,
        name: product.name,
        description: product.description,
        price: product.price,
        cost: product.cost,
        category_id: product.category_id,
        size_id: product.size_id,
        is_available: product.is_available
    });

    if (!validatedFields.success) {
        // Usa o método flatten para simplificar os erros
        return validatedFields.error.flatten().fieldErrors;
    } 
    return {}
};