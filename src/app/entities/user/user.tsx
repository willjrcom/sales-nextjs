import { z } from "zod";
import Company from "../company/company";
import Person from "../person/person";
import { SchemaContact } from "../contact/contact";
import { SchemaAddressUser } from "../address/address";

export default class User extends Person {
    id: string = '';
    companies: Company [] = [];

    constructor(data: Partial<User> = {}) {
        super();
        Object.assign(this, data);
    }
};


const SchemaUser = z.object({
    name: z.string().min(3, 'Nome precisa ter pelo menos 3 caracteres').max(100, 'Nome precisa ter no máximo 100 caracteres'),
    email: z.string().email('Email inválido'),
    cpf: z.string().min(11, 'CPF precisa ter pelo menos 11 caracteres').max(14, 'CPF precisa ter no máximo 14 caracteres'),
    birthday: z.string(),
    contact: SchemaContact,
    address: SchemaAddressUser,
});

export const ValidateUserForm = (user: User) => {
    const validatedFields = SchemaUser.safeParse({
        name: user.name,
        email: user.email,
        cpf: user.cpf,
        birthday: user.birthday,
        contact: user.contact,
        address: user.address,
    });

    if (!validatedFields.success) {
        // Usa o método flatten para simplificar os erros
        return validatedFields.error.flatten().fieldErrors;
    } 
    
    return {}
};