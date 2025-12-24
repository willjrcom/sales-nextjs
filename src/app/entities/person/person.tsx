import Address from "../address/address";
import Contact from "../contact/contact";

export default class Person {
    image_path: string = '';
    name: string = '';
    email: string = '';
    cpf?: string;
    birthday?: string;
    contact: Contact = new Contact();
    address: Address = new Address();

    constructor(data: Partial<Person> = {}) {
        Object.assign(this, data);
    }
};
