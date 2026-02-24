import { z } from "zod";
import Category from "../category/category";

export default class ProcessRule {
    id: string = '';
    name: string = '';
    order: number = 1;
    description: string = '';
    image_path?: string = '';
    ideal_time: string = '00:00';
    category_id: string = '';
    category?: Category = new Category();
    total_order_process_late: number = 0;
    total_order_queue: number = 0;
    is_active: boolean = true;

    constructor(data: Partial<ProcessRule> = {}) {
        Object.assign(this, data);
    }
}

export const SchemaProcessRule = z.object({
    id: z.string().optional(),
    name: z.string().min(3, 'Nome precisa ter pelo menos 3 caracteres').max(100, 'Nome precisa ter no máximo 100 caracteres'),
    order: z.number().min(1, 'A primeira ordem deve ser 1'),
    description: z.string().optional().or(z.literal('')),
    ideal_time: z.string().min(5, 'Informe o tempo ideal (mm:ss)')
        .refine(t => t !== '00:00', 'Tempo ideal deve ser maior que zero')
        .refine(t => {
            const [m, s] = t.split(':').map(Number);
            return (m < 60) || (m === 60 && s === 0);
        }, 'Tempo ideal não pode ultrapassar 60 minutos'),
    category_id: z.string().uuid("Categoria inválida"),
    is_active: z.boolean().optional(),
});

export type ProcessRuleFormData = z.infer<typeof SchemaProcessRule>;
