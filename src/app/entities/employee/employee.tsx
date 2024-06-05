import { Person } from "../person/person";
import { User } from "../user/user";

export default class Employee extends Person {
    user_id: string = '';
    user: User = new User();

    constructor(person: Person = new Person(), user_id: string = '', user: User = new User()) {
        // Call the super constructor with the name and age from the Person object
        super(person.id, person.name, person.email, person.cpf, person.birthday, person.contact, person.address);
        this.user_id = user_id;
        this.user = user;
    }
};