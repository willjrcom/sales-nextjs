import ProcessRule from "../process-rule/process-rule";
import Product from "../product/product";
import Size from "../size/size";

export default class Category {
    id: string = "";
    image_path: string = "";
    name: string = "";
    sizes: Size[] = [];
    products: Product[] = [];
    process_rules: ProcessRule[] = [];
    
    constructor() {}
}
