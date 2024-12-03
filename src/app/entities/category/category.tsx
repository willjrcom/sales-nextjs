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
    removable_ingredients: string[] = [];
    sizes: Size[] = [];
    products: Product[] = [];
    quantities: Quantity[] = [];
    process_rules: ProcessRule[] = [];
    product_category_to_additional: Category[] = [];
    product_category_to_complement: Category[] = [];
    
    constructor(id = "", name = "", image_path = "", need_print = false, removable_ingredients: string[] = [], sizes: Size[] = [], products: Product[] = [], quantities: Quantity[] = [], process_rules: ProcessRule[] = [], product_category_to_additional: Category[] = [], product_category_to_complement: Category[] = []) {
        this.id = id;
        this.name = name;
        this.image_path = image_path;
        this.need_print = need_print;
        this.sizes = sizes;
        this.removable_ingredients = removable_ingredients;
        this.products = products;
        this.quantities = quantities;
        this.process_rules = process_rules;
        this.product_category_to_additional = product_category_to_additional;
        this.product_category_to_complement = product_category_to_complement;
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