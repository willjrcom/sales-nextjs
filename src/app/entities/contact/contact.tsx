class Contact {
    id: string = '';
    ddd: string = '';
    number: string = '';
    type: ContactType = ContactType.Client;
    object_id: string = '';

    constructor() {}
};

enum ContactType {
    Client = "Client",
    Employee = "Employee",
}

export default Contact
export { ContactType }