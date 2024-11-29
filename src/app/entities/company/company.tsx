import { z } from "zod";

export default class Company {
    id: string = "";
    schema_name: string = "";
    business_name: string = "";
    email: string = "";
    trade_name: string = "";
    cnpj: string = "";

    constructor(id = "", schema_name = "", business_name = "", email = "", trade_name = "", cnpj = "") {
        this.id = id;
        this.schema_name = schema_name;
        this.business_name = business_name;
        this.email = email;
        this.trade_name = trade_name;
        this.cnpj = cnpj;
    }
}

const SchemaCompany = z.object({
    email: z.string().email('Email inválido'),
    cnpj: z.string().min(14, 'Cnpj inválido').max(18, 'Cnpj inválido'),
    business_name: z.string().min(3, 'Nome precisa ter pelo menos 3 caracteres').max(100, 'Nome precisa ter no máximo 100 caracteres'),
});

export const ValidateCompanyForm = (company: Company) => {
    const validatedFields = SchemaCompany.safeParse({
        email: company.email,
        cnpj: company.cnpj,
        business_name: company.business_name
    });

    if (!validatedFields.success) {
        // Usa o método flatten para simplificar os erros
        return validatedFields.error.flatten().fieldErrors;
    } 
    return {}
};