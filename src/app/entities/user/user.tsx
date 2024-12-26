import Company from "../company/company";
import Person from "../person/person";

export class User {
    person: Person = new Person();
    companies: Company [] = [];

    constructor(person: Person = new Person(), companies = []) {
        this.person = person;
        this.companies = companies;
    }
};