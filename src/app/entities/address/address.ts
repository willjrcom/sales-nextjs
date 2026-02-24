import Decimal from 'decimal.js';

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
    coordinates: Coordinates = new Coordinates();

    constructor(data: Partial<Address> = {}) {
        Object.assign(this, data);
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

    constructor(data: Partial<Coordinates> = {}) {
        Object.assign(this, data);
    }
}
