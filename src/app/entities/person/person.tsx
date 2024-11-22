import Address from "../address/address";
import Contact from "../contact/contact";

export class Person {
    id: string = "";
    name: string = "";
    email: string = "";
    cpf: string = "";
    birthday: string = "";
    contact: Contact = new Contact();
    address: Address = new Address();

    constructor(id: string = "", name: string = "", email: string = "", cpf: string = "", birthday: string = "", contact: Contact = new Contact(), address: Address = new Address(), likeTax: boolean = false) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.cpf = cpf;
        this.birthday = birthday;
        this.contact = contact;
        this.address = address;
        this.address.likeTax = likeTax
    }
};

export default Person