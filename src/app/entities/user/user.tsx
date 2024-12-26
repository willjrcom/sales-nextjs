import Company from "../company/company";
import Person from "../person/person";

export default class User extends Person {
    companies: Company [] = [];

    constructor(person: Person = new Person(), companies = []) {
        super(person.id, person.name, person.email, person.cpf, person.birthday, person.contact, person.address, true);
        this.companies = companies;
    }
};