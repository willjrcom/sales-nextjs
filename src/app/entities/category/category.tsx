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
    is_additional: boolean = false;
    is_complement: boolean = false;
    is_active: boolean = true;
    sizes: Size[] = [];
    quantities: Quantity[] = [];
    products: Product[] = [];
    additional_categories: Category[] = [];
    complement_categories: Category[] = [];
    process_rules: ProcessRule[] = [];

    constructor(data: Partial<Category> = {}) {
        Object.assign(this, data);
    }
}

const SchemaCategory = z.object({
    name: z.string().min(3, 'Nome precisa ter pelo menos 3 caracteres').max(100, 'Nome precisa ter no máximo 100 caracteres'),
    image_path: z.string().optional(),
    need_print: z.boolean(),
    printer_name: z.string().optional(),
    use_process_rule: z.boolean(),
    is_active: z.boolean(),
});

export const ValidateCategoryForm = (category: Category) => {
    const validatedFields = SchemaCategory.safeParse({
        name: category.name,
        image_path: category.image_path,
        need_print: category.need_print,
        printer_name: category.printer_name,
        use_process_rule: category.use_process_rule,
        is_active: category.is_active,
    });

    if (!validatedFields.success) {
        // Usa o método flatten para simplificar os erros
        return validatedFields.error.flatten().fieldErrors;
    }
    return {}
};

export class CategoryMap {
    id: string = '';
    name: string = '';

    constructor(data: Partial<CategoryMap> = {}) {
        Object.assign(this, data);
    }
}

