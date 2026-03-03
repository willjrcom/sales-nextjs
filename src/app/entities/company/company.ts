import { z } from "zod";
import Address, { SchemaAddress } from "../address/address";
import { CompanyCategory } from "./company-category";

export default class Company {
  // ... (rest of the class)
  id: string = "";
  schema_name: string = "";
  business_name: string = "";
  email: string = "";
  trade_name: string = "";
  cnpj: string = "";
  contacts: string[] = [];
  address: Address = new Address();
  preferences: Record<string, string> = {};
  subscription_expires_at?: string | null;
  plan_type?: string;
  is_blocked: boolean = false;
  image_path: string = '';
  categories: CompanyCategory[] = [];
  schedules: Schedule[] = [];

  monthly_payment_due_day?: number;
  monthly_payment_due_day_updated_at?: string;

  constructor(data: Partial<Company> = {}) {
    Object.assign(this, data);
  }
}



export const SchemaCompany = z.object({
  id: z.string().optional(),
  cnpj: z.string().min(14, "Cnpj inválido").max(18, "Cnpj inválido"),
  trade_name: z
    .string()
    .min(3, "Nome precisa ter pelo menos 3 caracteres")
    .max(100, "Nome precisa ter no máximo 100 caracteres"),
  image_path: z.string().optional().or(z.literal("")),
  contacts: z.array(z.string().min(8, "Contato inválido").or(z.object({ value: z.string().min(8, "Contato inválido") }))).min(1, "Adicione pelo menos um contato"),
  categories: z.array(z.any()).optional(),
  preferences: z.record(z.string()).optional(),
  address: z.any().optional(),
  monthly_payment_due_day: z.number().optional(),
  schedules: z.array(z.object({
    day_of_week: z.number(),
    is_open: z.boolean(),
    hours: z.array(z.object({
      opening_time: z.string(),
      closing_time: z.string()
    }))
  })).optional(),
});

export const SchemaCompanyUpdate = SchemaCompany.extend({
  address: z.object({
    street: z.string({ required_error: 'Rua é obrigatória', invalid_type_error: 'Rua inválida' }).min(3, 'Rua precisa ter pelo menos 3 caracteres').max(100, 'Rua precisa ter no máximo 100 caracteres'),
    number: z.string({ required_error: 'Número é obrigatório', invalid_type_error: 'Número inválido' }).min(1, 'Endereço: Número minimo 1 caracter'),
    neighborhood: z.string({ required_error: 'Bairro é obrigatório', invalid_type_error: 'Bairro inválido' }).min(3, 'Bairro precisa ter pelo menos 3 caracteres').max(100, 'Bairro precisa ter no máximo 100 caracteres'),
    complement: z.string({ required_error: 'Complemento é obrigatório', invalid_type_error: 'Complemento inválido' }).max(100, 'Complemento precisa ter no máximo 100 caracteres').optional(),
    reference: z.string({ required_error: 'Referência é obrigatória', invalid_type_error: 'Referência inválida' }).max(100, 'Referência precisa ter no máximo 100 caracteres').optional(),
    city: z.string({ required_error: 'Cidade é obrigatória', invalid_type_error: 'Cidade inválida' }).min(3, 'Cidade precisa ter pelo menos 3 caracteres').max(100, 'Cidade precisa ter no máximo 100 caracteres'),
    uf: z.string({ required_error: 'Estado é obrigatório', invalid_type_error: 'Estado inválido' }).min(2, 'Estado precisa ter pelo menos 2 caracteres').max(2, 'Estado precisa ter no máximo 2 caracteres'),
    cep: z.string({ required_error: 'Cep é obrigatório', invalid_type_error: 'Cep inválido' })
      .min(9, 'Cep inválido')
      .max(9, 'Cep inválido')
      .regex(/^\d{5}-\d{3}$/, 'Formato de CEP inválido (xxxxx-xxx)'),
  })
});

export const ValidateCompanyForm = (company: Company) => {
  const validatedFields = SchemaCompany.safeParse(company);

  if (!validatedFields.success) {
    // Usa o método flatten para simplificar os erros
    return validatedFields.error.flatten().fieldErrors;
  }
  return {};
};

export interface Schedule {
  day_of_week: number;
  is_open: boolean;
  hours: BusinessHour[];
}

export interface BusinessHour {
  opening_time: string;
  closing_time: string;
}
