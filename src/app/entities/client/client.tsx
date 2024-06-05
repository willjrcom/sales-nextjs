import Person from "../person/person";

export class Client extends Person {
    constructor(person: Person = new Person()) {
        super(person.id, person.name, person.email, person.cpf, person.birthday, person.contact, person.address);
    }
};