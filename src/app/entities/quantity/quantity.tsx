import { z } from "zod";

export default class Quantity {
  id: string = "";
  quantity: number = 0;
  category_id: string = "";

  constructor(id = "", quantity = 0, category_id = "") {
    this.id = id;
    this.quantity = quantity;
    this.category_id = category_id;
  }
}

const SchemaQuantity = z.object({
  quantity: z.number().positive("Quantidade precisa ser um valor positivo"),
  category_id: z.string().uuid("Categoria inválida"),
});

export const ValidateQuantityForm = (quantity: Quantity) => {
  const validatedFields = SchemaQuantity.safeParse({
    quantity: quantity.quantity,
    category_id: quantity.category_id
  });

  if (!validatedFields.success) {
      // Usa o método flatten para simplificar os erros
      return validatedFields.error.flatten().fieldErrors;
  } 
  return {}
};