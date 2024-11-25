import { optional, z } from "zod";

export default class ProcessRule {
    id: string = "";
    name: string = "";
    order: number = 0;
    description: string = "";
    image_path: string = "";
    ideal_time: number = 0;
    experimental_error: number = 0;
    ideal_time_formatted: string = "";
    experimental_error_formatted: string = "";
    category_id: string = "";

    constructor() {}
}

const SchemaProcessRule = z.object({
    image_path: z.string().optional(),
    name: z.string().min(3, 'Nome precisa ter pelo menos 3 caracteres').max(100, 'Nome precisa ter no máximo 100 caracteres'),
    order: z.number().min(1, 'A primeira ordem deve ser 1'),
    description: z.string().optional(),
    ideal_time: z.number().min(1, 'Tempo ideal inválido'),
    experimental_error: z.number().min(1, 'Erro experimental inválido'),
    ideal_time_formatted: z.string().optional(),
    experimental_error_formatted: z.string().optional(),
    category_id: z.string().uuid("Categoria inválida"),
});

export const ValidateProcessRuleForm = (category: ProcessRule) => {
    const validatedFields = SchemaProcessRule.safeParse({
        image_path: category.image_path,
        name: category.name,
        order: category.order,
        description: category.description,
        ideal_time: category.ideal_time,
        experimental_error: category.experimental_error,
        ideal_time_formatted: category.ideal_time_formatted,
        experimental_error_formatted: category.experimental_error_formatted
    });

    if (!validatedFields.success) {
        // Usa o método flatten para simplificar os erros
        return validatedFields.error.flatten().fieldErrors;
    } 
    return {}
};