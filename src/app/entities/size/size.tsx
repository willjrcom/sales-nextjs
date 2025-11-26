import { z } from "zod";

export default class Size {
  id: string = '';
  name: string = '';
  is_active: boolean = true;
  category_id: string = '';

  constructor(data: Partial<Size> = {}) {
    Object.assign(this, data);
}
}

const SchemaSize = z.object({
  name: z.string().min(1, 'Tamanho precisa ter pelo menos 1 caracter').max(100, 'Tamanho precisa ter no máximo 100 caracteres'),
  is_active: z.boolean(),
  category_id: z.string().uuid("Categoria inválida"),
});

export const ValidateSizeForm = (size: Size) => {
  const validatedFields = SchemaSize.safeParse({
    name: size.name,
    is_active: size.is_active,
    category_id: size.category_id
  });

  if (!validatedFields.success) {
      // Usa o método flatten para simplificar os erros
      return validatedFields.error.flatten().fieldErrors;
  } 
  return {}
};