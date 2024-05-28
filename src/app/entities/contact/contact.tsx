import { UUID } from "crypto";

export type Contact = {
    id: string;
    ddd: string;
    number: string;
    type: ContactType;
    object_id: string;
};

export enum ContactType {
    Client = "Client",
    Employee = "Employee",
}