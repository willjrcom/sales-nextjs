import { z } from "zod";

export default class ProcessRule {
    id: string = "";
    name: string = "";
    order: number = 0;
    description: string = "";
    image_path?: string = "";
    ideal_time: string = "";
    category_id: string = "";
    total_order_process_late: number = 0;
    total_order_queue: number = 0;

    constructor(data: Partial<ProcessRule> = {}) {
        Object.assign(this, data);
    }
}

const SchemaProcessRule = z.object({
    name: z.string().min(3, 'Nome precisa ter pelo menos 3 caracteres').max(100, 'Nome precisa ter no máximo 100 caracteres'),
    order: z.number().min(1, 'A primeira ordem deve ser 1'),
    description: z.string().optional(),
    ideal_time: z.string().min(2, 'Tempo ideal inválido'),
    category_id: z.string().uuid("Categoria inválida"),
});

export const ValidateProcessRuleForm = (category: ProcessRule) => {
    const validatedFields = SchemaProcessRule.safeParse({
        name: category.name,
        order: category.order,
        description: category.description,
        ideal_time: category.ideal_time,
        category_id: category.category_id
    });

    if (!validatedFields.success) {
        // Usa o método flatten para simplificar os erros
        return validatedFields.error.flatten().fieldErrors;
    } 
    return {}
};