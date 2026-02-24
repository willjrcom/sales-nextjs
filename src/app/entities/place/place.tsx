import { z } from "zod";
import PlaceTable from "./place_table";

export default class Place {
    id: string = '';
    name: string = '';
    image_path: string = '';
    is_available: boolean = true;
    is_active: boolean = true;
    tables: PlaceTable[] = [];

    constructor(data: Partial<Place> = {}) {
        Object.assign(this, data);
    }
}

export const SchemaPlace = z.object({
    id: z.string().optional(),
    image_path: z.string().optional().or(z.literal('')),
    name: z.string().min(2, 'Nome precisa ter pelo menos 2 caracteres').max(100, 'Nome precisa ter no máximo 100 caracteres'),
    is_available: z.boolean().optional(),
    is_active: z.boolean().optional(),
});

export type PlaceFormData = z.infer<typeof SchemaPlace>;