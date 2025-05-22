import { z } from "zod";
import Decimal from 'decimal.js';

export const addressTypes = [
    'house',
    'apartment',
    'condominium',
    'work',
    'hotel',
    'shed'
] as const;

export const AddressTypesWithId: { id: string; name: string }[] = Array.from(addressTypes, (type) => ({
    id: type,
    name: translateToPortuguese(type),
}));

export const addressUFs = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA',
    'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
]

export const addressUFsWithId: { id: string; name: string }[] = Array.from(addressUFs, (uf) => ({
    id: uf,
    name: uf,
}));

function translateToPortuguese(type: string): string {
    const translations: Record<string, string> = {
        house: 'Casa',
        apartment: 'Apartamento',
        condominium: 'Condomínio',
        work: 'Trabalho',
        hotel: 'Hotel',
        shed: 'Galpão',
    };
    return translations[type] || type;
}

export default class Address {
    id?: string;
    object_id?: string = '';
    street: string = '';
    number: string = '';
    complement: string = '';
    reference: string = '';
    neighborhood: string = '';
    city: string = '';
    uf: string = '';
    cep: string = '';
    delivery_tax: Decimal = new Decimal(0);
    likeTax: boolean = false;
    coordinates: Coordinates = new Coordinates();
    address_type: string = '';

constructor(
    id?: string,
    object_id = '',
    street = '',
    number = '',
    complement = '',
    reference = '',
    neighborhood = '',
    city = '',
    uf = '',
    cep = '',
    delivery_tax: Decimal = new Decimal(0),
    adress_type = '',
    likeTax: boolean = false,
    coordinates?: Coordinates
) {
        this.id = id
        this.object_id = object_id
        this.street = street
        this.number = number
        this.complement = complement
        this.reference = reference
        this.neighborhood = neighborhood
        this.city = city
        this.uf = uf
        this.cep = cep
        this.delivery_tax = delivery_tax
        this.likeTax = likeTax
        this.coordinates = coordinates || new Coordinates()
        this.address_type = adress_type
    }

    public getSmallAddress() {
        const parts = [
            this.street,
            this.number,
            this.neighborhood,
        ];

        return parts.filter(Boolean).join(", ");
    }

    public getMediumAddress() {
        const parts = [
            this.street,
            this.number,
            this.complement,
            this.neighborhood,
        ];

        return parts.filter(Boolean).join(", ");
    }
    toString() {
        const parts = [
            this.street,
            this.number,
            this.neighborhood,
            this.city,
            this.uf,
        ];

        // Filtra os campos que são null, undefined ou strings vazias
        return parts.filter(Boolean).join(", ");
    }
}

export class Coordinates {
    latitude: number = 0;
    longitude: number = 0;

    constructor(latitude = 0, longitude = 0) {
        this.latitude = latitude;
        this.longitude = longitude;
    }
}

export const SchemaAddress = z.object({
    cep: z.string().min(8, 'Cep inválido').max(9, 'Cep inválido'),
    street: z.string().min(3, 'Rua precisa ter pelo menos 3 caracteres').max(100, 'Rua precisa ter no máximo 100 caracteres'),
    number: z.string().min(1, 'Endereço: Número minimo 1 caracter'),
    complement: z.string().max(100, 'Complemento precisa ter no máximo 100 caracteres'),
    reference: z.string().max(100, 'Referência precisa ter no máximo 100 caracteres'),
    neighborhood: z.string().min(3, 'Bairro precisa ter pelo menos 3 caracteres').max(100, 'Bairro precisa ter no máximo 100 caracteres'),
    city: z.string().min(3, 'Cidade precisa ter pelo menos 3 caracteres').max(100, 'Cidade precisa ter no máximo 100 caracteres'),
    uf: z.string().min(2, 'Estado precisa ter pelo menos 2 caracteres').max(2, 'Estado precisa ter no máximo 2 caracteres'),
    delivery_tax: z.coerce.number().min(0, 'Taxa de entrega inválida'),
    object_id: z.string().optional(),
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
        uf: address.uf,
        delivery_tax: address.delivery_tax.toNumber(),
        object_id: address.object_id
    });

    if (!validatedFields.success) {
        // Usa o método flatten para simplificar os erros
        return validatedFields.error.flatten().fieldErrors;
    }
    return {}
};