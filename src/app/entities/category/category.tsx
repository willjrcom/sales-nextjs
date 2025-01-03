import { z } from "zod";
import ProcessRule from "../process-rule/process-rule";
import Product from "../product/product";
import Quantity from "../quantity/quantity";
import Size from "../size/size";

export default class Category {
    id: string = "";
    name: string = "";
    image_path: string = "";
    need_print: boolean = false;
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
    
    constructor(id = "", name = "", image_path = "", need_print = false, use_process_rule = false, removable_ingredients: string[] = [], sizes: Size[] = [], products: Product[] = [], quantities: Quantity[] = [], process_rules: ProcessRule[] = [], is_additional = false, is_complement = false, additional_categories: Category[] = [], complement_categories: Category[] = []) {
        this.id = id;
        this.name = name;
        this.image_path = image_path;
        this.need_print = need_print;
        use_process_rule = use_process_rule;
        this.sizes = sizes;
        this.removable_ingredients = removable_ingredients;
        this.products = products;
        this.quantities = quantities;
        this.process_rules = process_rules;
        this.is_additional = is_additional;
        this.is_complement = is_complement;
        this.additional_categories = additional_categories;
        this.complement_categories = complement_categories;
    }
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