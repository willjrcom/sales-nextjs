import { z } from "zod";

export interface CompanyCategory {
    id: string
    name: string
    image_path?: string
}

export const SchemaCompanyCategory = z.object({
    name: z.string().min(1, 'Nome é obrigatório'),
    image_path: z.string().optional().or(z.literal('')),
});

export type CompanyCategoryFormData = z.infer<typeof SchemaCompanyCategory>;