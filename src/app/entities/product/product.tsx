import Category from "../category/category";
import Size from "../size/size";

export default class Product {
    id: string = "";
    code: string = "";
    image_path: string = "";
    name: string = "";
    description: string = "";
    price: number = 0;
    cost: number = 0;
    category_id: string = "";
    category: Category = new Category();
    size_id: string = "";
    size: Size = new Size();
    is_available: boolean = false;

    constructor() {}
}
