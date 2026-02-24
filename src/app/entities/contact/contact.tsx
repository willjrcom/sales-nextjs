import { z } from "zod";

export default class Contact {
    id?: string;
    number: string = '';
    type: ContactType = ContactType.Client;
    object_id?: string = '';

    constructor(data: Partial<Contact> = {}) {
        Object.assign(this, data);
    }
};

export enum ContactType {
    Client = "Client",
    Employee = "Employee",
}
