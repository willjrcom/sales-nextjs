import { z } from "zod";
import ProcessRule from "../process-rule/process-rule";
import Product from "../product/product";
import Quantity from "../quantity/quantity";
import Size from "../size/size";

export default class Category {
    id: string = "";
    image_path: string = "";
    name: string = "";
    sizes: Size[] = [];
    products: Product[] = [];
    quantities: Quantity[] = [];
    process_rules: ProcessRule[] = [];
    
    constructor() {}
}

const SchemaCategory = z.object({
    image_path: z.string().optional(),
    name: z.string().min(3, 'Nome precisa ter pelo menos 3 caracteres').max(100, 'Nome precisa ter no máximo 100 caracteres'),
});

export const ValidateCategoryForm = (category: Category) => {
    const validatedFields = SchemaCategory.safeParse({
        image_path: category.image_path,
        name: category.name
    });

    if (!validatedFields.success) {
        // Usa o método flatten para simplificar os erros
        return validatedFields.error.flatten().fieldErrors;
    } 
    return {}
};