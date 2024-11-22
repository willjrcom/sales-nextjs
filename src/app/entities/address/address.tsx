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
