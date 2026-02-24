import { z } from "zod";

export default class Table {
    id: string = '';
    name: string = '';
    is_available: boolean = true;
    is_active: boolean = true;

    constructor(data: Partial<Table> = {}) {
        Object.assign(this, data);
    }
}

export const SchemaTable = z.object({
    id: z.string().optional(),
    name: z.string().min(3, 'Nome precisa ter pelo menos 3 caracteres').max(100, 'Nome precisa ter no máximo 100 caracteres'),
    is_available: z.boolean().optional(),
    is_active: z.boolean().optional(),
});

export type TableFormData = z.infer<typeof SchemaTable>;
