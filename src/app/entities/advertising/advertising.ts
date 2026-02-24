import { z } from "zod";
import { Sponsor } from "../sponsor/sponsor";

export interface Advertising {
    id: string
    title: string
    description?: string
    link?: string
    contact?: string
    type: string
    started_at?: string | null
    ended_at?: string | null
    cover_image_path?: string
    images?: string[]
    sponsor_id: string
    sponsor?: Sponsor
}

export const SchemaAdvertising = z.object({
    title: z.string().min(1, 'Título é obrigatório'),
    description: z.string().optional().or(z.literal('')),
    link: z.string().url('Link inválido').optional().or(z.literal('')),
    contact: z.string().optional().or(z.literal('')),
    type: z.string().min(1, 'Tipo é obrigadorio (inglês)'),
    started_at: z.string().optional().nullable(),
    ended_at: z.string().optional().nullable(),
    cover_image_path: z.string().optional().or(z.literal('')),
    images: z.array(z.string()).optional(),
    sponsor_id: z.string().uuid('ID do patrocinador inválido').min(1, 'Sponsor é obrigatório'),
});

export type AdvertisingFormData = z.infer<typeof SchemaAdvertising>;
