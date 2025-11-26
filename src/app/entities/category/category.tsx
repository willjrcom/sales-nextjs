import { z } from "zod";
import ProcessRule from "../process-rule/process-rule";
import Product from "../product/product";
import Quantity from "../quantity/quantity";
import Size from "../size/size";

export default class Category {
    id: string = '';
    name: string = '';
    image_path: string = '';
    need_print: boolean = false;
    printer_name: string = '';
    use_process_rule: boolean = false;
    removable_ingredients: string[] = [];
    sizes: Size[] = [];
    products: Product[] = [];
    quantities: Quantity[] = [];
    process_rules: ProcessRule[] = [];
    is_additional: boolean = false;
    is_complement: boolean = false;
    additional_categories: Category[] = [];
    complement_categories: Category[] = [];
    
    constructor(data: Partial<Category> = {}) {
        Object.assign(this, data);
    }
}

const SchemaCategory = z.object({
    name: z.string().min(3, 'Nome precisa ter pelo menos 3 caracteres').max(100, 'Nome precisa ter no máximo 100 caracteres'),
});

export const ValidateCategoryForm = (category: Category) => {
    const validatedFields = SchemaCategory.safeParse({
        name: category.name,
    });

    if (!validatedFields.success) {
        // Usa o método flatten para simplificar os erros
        return validatedFields.error.flatten().fieldErrors;
    } 
    return {}
};