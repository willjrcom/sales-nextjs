import { z } from "zod";

export default class Quantity {
  id: string = "";
  quantity: number = 0;
  is_active: boolean = false;
  category_id: string = "";

  constructor() {}
}

const SchemaQuantity = z.object({
  quantity: z.number().positive("Quantidade precisa ser um valor positivo"),
  is_active: z.boolean(),
  category_id: z.string().uuid("Categoria inválida"),
});

export const ValidateQuantityForm = (place: Quantity) => {
  const validatedFields = SchemaQuantity.safeParse({
    quantity: place.quantity,
    is_active: place.is_active,
    category_id: place.category_id
  });

  if (!validatedFields.success) {
      // Usa o método flatten para simplificar os erros
      return validatedFields.error.flatten().fieldErrors;
  } 
  return {}
};