export default class Address {
    id: string;
    object_id: string;
    street: string;
    number: string;
    complement: string;
    reference: string;
    neighborhood: string;
    city: string;
    state: string;
    cep: string;
    delivery_tax: number;

    constructor(
        id: string = '',
        object_id: string = '',
        street: string = '',
        number: string = '',
        complement: string = '',
        reference: string = '',
        neighborhood: string = '',
        city: string = '',
        state: string = '',
        cep: string = '',
        delivery_tax: number = 0
    ) {
        this.id = id;
        this.object_id = object_id;
        this.street = street;
        this.number = number;
        this.complement = complement;
        this.reference = reference;
        this.neighborhood = neighborhood;
        this.city = city;
        this.state = state;
        this.cep = cep;
        this.delivery_tax = delivery_tax;
    }
}
