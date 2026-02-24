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

export const SchemaSize = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Tamanho precisa ter pelo menos 1 caracter').max(100, 'Tamanho precisa ter no máximo 100 caracteres'),
  is_active: z.boolean().optional(),
  category_id: z.string().uuid("Categoria inválida"),
});

export type SizeFormData = z.infer<typeof SchemaSize>;
