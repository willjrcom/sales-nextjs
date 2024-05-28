import { UUID } from "crypto";
import { Category } from "../category/category";
import { Person } from "../person/person";
import { Size } from "../size/size";
import { User } from "../user/user";

export type Employee = Person & {
    user_id: UUID;
    user: User;
};