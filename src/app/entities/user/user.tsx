import { z } from "zod";
import Company from "../company/company";
import Person from "../person/person";
import { ContactType } from "../contact/contact";

export default class User extends Person {
    id: string = '';
    companies: Company[] = [];

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
    contact: z.string().min(9, 'Celular: Número inválido').max(15, 'Celular: Número inválido').or(z.literal('')),
    cep: z.string().min(8, 'Cep inválido').max(9, 'Cep inválido').optional().or(z.literal('')),
    street: z.string().min(3, 'Rua precisa ter pelo menos 3 caracteres').max(100, 'Rua precisa ter no máximo 100 caracteres'),
    number: z.string().min(1, 'Endereço: Número minimo 1 caracter'),
    neighborhood: z.string().min(3, 'Bairro precisa ter pelo menos 3 caracteres').max(100, 'Bairro precisa ter no máximo 100 caracteres'),
    city: z.string().min(3, 'Cidade precisa ter pelo menos 3 caracteres').max(100, 'Cidade precisa ter no máximo 100 caracteres').optional(),
    uf: z.string().min(2, 'Estado precisa ter pelo menos 2 caracteres').max(2, 'Estado precisa ter no máximo 2 caracteres').optional(),
});

export const ValidateUserForm = (user: User) => {
    const validatedFields = SchemaUser.safeParse({
        name: user.name,
        email: user.email,
        cpf: user.cpf,
        birthday: user.birthday,
        contact: user.contact.number,

        cep: user.address.cep,
        street: user.address.street,
        number: user.address.number,
        neighborhood: user.address.neighborhood,
        city: user.address.city,
        uf: user.address.uf,
    });

    if (!validatedFields.success) {
        // Usa o método flatten para simplificar os erros
        return validatedFields.error.flatten().fieldErrors;
    }

    return {}
};

const createSchemaUser = z.object({
    name: z.string().min(3, 'Nome precisa ter pelo menos 3 caracteres').max(100, 'Nome precisa ter no máximo 100 caracteres'),
    email: z.string().email('Email inválido'),
    cpf: z.string().min(11, 'CPF precisa ter pelo menos 11 caracteres').max(14, 'CPF precisa ter no máximo 14 caracteres'),
});

export const ValidateUserFormCreate = (user: User) => {
    const validatedFields = createSchemaUser.safeParse({
        name: user.name,
        email: user.email,
        cpf: user.cpf,
    });

    if (!validatedFields.success) {
        // Usa o método flatten para simplificar os erros
        return validatedFields.error.flatten().fieldErrors;
    }

    return {}
};