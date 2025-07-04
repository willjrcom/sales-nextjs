import { z } from "zod";
import Table from "../table/table";
import PlaceTable from "./place_table";

export default class Place {
    id: string = "";
    name: string = "";
    image_path: string = "";
    is_available: boolean = true;
    tables: PlaceTable[] = [];
    
    constructor(data: Partial<Place> = {}) {
        Object.assign(this, data);
    }
}

const SchemaPlace = z.object({
    image_path: z.string().optional(),
    name: z.string().min(2, 'Nome precisa ter pelo menos 2 caracteres').max(100, 'Nome precisa ter no máximo 100 caracteres'),
    is_available: z.boolean(),
});

export const ValidatePlaceForm = (place: Place) => {
    const validatedFields = SchemaPlace.safeParse({
        image_path: place.image_path,
        name: place.name,
        is_available: place.is_available
    });

    if (!validatedFields.success) {
        // Usa o método flatten para simplificar os erros
        return validatedFields.error.flatten().fieldErrors;
    } 
    return {}
};