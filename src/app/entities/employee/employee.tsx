import { Person } from "../person/person";
import { User } from "../user/user";

export class Employee extends Person {
    user_id: string = '';
    user: User = new User();

    constructor() {
        super();
    }
};