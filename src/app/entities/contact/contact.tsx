class Contact {
    id: string;
    ddd: string;
    number: string;
    type: ContactType;
    object_id: string;

    constructor(
        id: string = '',
        ddd: string = '',
        number: string = '',
        type: ContactType = ContactType.Client,
        object_id: string = ''
    ) {
        this.id = id;
        this.ddd = ddd;
        this.number = number;
        this.type = type;
        this.object_id = object_id;
    }
};

enum ContactType {
    Client = "Client",
    Employee = "Employee",
}

export default Contact
export { ContactType }