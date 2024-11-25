import { z } from "zod";

export default class Address {
    id: string = '';
    object_id: string = '';
    street: string = '';
    number: string = '';
    complement: string = '';
    reference: string = '';
    neighborhood: string = '';
    city: string = '';
    state: string = '';
    cep: string = '';
    delivery_tax: number = 0;
    likeTax?: boolean = false

    constructor(likeTax: boolean = false) {
        this.likeTax = likeTax
    }
}

export const SchemaAddress = z.object({
    cep: z.string().min(8, 'Cep inválido').max(9, 'Cep inválido'),
    street: z.string().min(3, 'Rua precisa ter pelo menos 3 caracteres').max(100, 'Rua precisa ter no máximo 100 caracteres'),
    number: z.string().min(1, 'Número inválido').max(10, 'Número inválido'),
    complement: z.string().max(100, 'Complemento precisa ter no máximo 100 caracteres'),
    reference: z.string().max(100, 'Referência precisa ter no máximo 100 caracteres'),
    neighborhood: z.string().min(3, 'Bairro precisa ter pelo menos 3 caracteres').max(100, 'Bairro precisa ter no máximo 100 caracteres'),
    city: z.string().min(3, 'Cidade precisa ter pelo menos 3 caracteres').max(100, 'Cidade precisa ter no máximo 100 caracteres'),
    state: z.string().min(2, 'Estado precisa ter pelo menos 2 caracteres').max(2, 'Estado precisa ter no máximo 2 caracteres'),
    delivery_tax: z.number().min(0, 'Taxa de entrega inválida'),
    object_id: z.string().uuid("Pessoa inválida"),
});


export const ValidateAddressForm = (address: Address) => {
    const validatedFields = SchemaAddress.safeParse({
        cep: address.cep,
        street: address.street,
        number: address.number,
        complement: address.complement,
        reference: address.reference,
        neighborhood: address.neighborhood,
        city: address.city,
        state: address.state,
        delivery_tax: address.delivery_tax,
        object_id: address.object_id
    });

    if (!validatedFields.success) {
        // Usa o método flatten para simplificar os erros
        return validatedFields.error.flatten().fieldErrors;
    } 
    return {}
};