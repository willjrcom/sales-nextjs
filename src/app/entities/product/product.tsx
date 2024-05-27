import { Category } from "../category/category";
import { Size } from "../size/size";

export type Product = {
    id: string;
    code: string;
    image_path: string;
    name: string;
    description: string;
    price: number;
    cost: number;
    category: Category;
    size: Size;
    is_available: boolean;
};