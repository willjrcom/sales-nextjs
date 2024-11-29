import Company from "../company/company";

export class User {
    email: string = '';
    companies: Company [] = [];

    constructor(email = "", companies = []) {
        this.email = email;
        this.companies = companies;
    }
};