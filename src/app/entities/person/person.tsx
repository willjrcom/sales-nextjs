import { Address } from "../address/address";
import { Category } from "../category/category";
import { Contact } from "../contact/contact";
import { Size } from "../size/size";

export type Person = {
    id: string;
    name: string;
    email: string;
    cpf: number;
    birthday: string;
    contact: Contact;
    address: Address;
};