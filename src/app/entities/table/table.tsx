import { z } from "zod";

export default class Table {
    id: string = "";
    name: string = "";
    is_available: boolean = false;
    
    constructor(id = "", name = "", is_available = false) {
        this.id = id;
        this.name = name;
        this.is_available = is_available;
    }
}

const SchemaTable = z.object({
    name: z.string().min(3, 'Nome precisa ter pelo menos 3 caracteres').max(100, 'Nome precisa ter no máximo 100 caracteres'),
    is_available: z.boolean(),
  });
  
  export const ValidateTableForm = (table: Table) => {
    const validatedFields = SchemaTable.safeParse({
        name: table.name,
        is_available: table.is_available
    });
  
    if (!validatedFields.success) {
        // Usa o método flatten para simplificar os erros
        return validatedFields.error.flatten().fieldErrors;
    } 
    return {}
  };