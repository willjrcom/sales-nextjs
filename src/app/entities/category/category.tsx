import { z } from "zod";
import ProcessRule from "../process-rule/process-rule";
import Product from "../product/product";
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
    allow_fractional: boolean = false;
    is_active: boolean = true;
    sizes: Size[] = [];
    products: Product[] = [];
    additional_categories: Category[] = [];
    complement_categories: Category[] = [];
    process_rules: ProcessRule[] = [];

    constructor(data: Partial<Category> = {}) {
        Object.assign(this, data);
    }
}

export const SchemaCategory = z.object({
    id: z.string().optional(),
    name: z.string().min(3, 'Nome precisa ter pelo menos 3 caracteres').max(100, 'Nome precisa ter no máximo 100 caracteres'),
    image_path: z.string().optional().or(z.literal('')),
    need_print: z.boolean(),
    printer_name: z.string().optional().or(z.literal('')),
    use_process_rule: z.boolean(),
    is_additional: z.boolean().optional(),
    is_complement: z.boolean().optional(),
    allow_fractional: z.boolean().optional(),
    is_active: z.boolean().optional(),
    removable_ingredients: z.array(z.string()).optional(),
    additional_categories: z.array(z.any()).optional(),
    complement_categories: z.array(z.any()).optional(),
});

export class CategoryMap {
    id: string = '';
    name: string = '';

    constructor(data: Partial<CategoryMap> = {}) {
        Object.assign(this, data);
    }
}

