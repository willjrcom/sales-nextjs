import { z } from "zod";
import Address from "../address/address";

export default class Company {
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
  is_blocked: boolean = false;

  monthly_payment_due_day?: number;
  monthly_payment_due_day_updated_at?: string;

  constructor(data: Partial<Company> = {}) {
    Object.assign(this, data);
  }
}



const SchemaCompany = z.object({
  cnpj: z.string().min(14, "Cnpj inválido").max(18, "Cnpj inválido"),
  trade_name: z
    .string()
    .min(3, "Nome precisa ter pelo menos 3 caracteres")
    .max(100, "Nome precisa ter no máximo 100 caracteres"),
});

export const ValidateCompanyForm = (company: Company) => {
  const validatedFields = SchemaCompany.safeParse({
    cnpj: company.cnpj,
    trade_name: company.trade_name,
  });

  if (!validatedFields.success) {
    // Usa o método flatten para simplificar os erros
    return validatedFields.error.flatten().fieldErrors;
  }
  return {};
};
