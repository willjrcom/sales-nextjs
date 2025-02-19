export default class Item {
    id: string = "";
    name: string = "";
    observation: string = "";
    price: number = 0;
    total_price: number = 0;
    size: string = "";
    quantity: number = 0;
    group_item_id: string = "";
    category_id: string = "";
    additional_items?: Item[] = [];
    removed_items?: string[] = [];
    product_id: string = "";

    constructor(id: string = "", name: string = "", price: number = 0, quantity: number = 0, size: string = "", product_id: string = "", group_item_id: string = "", category_id: string = "", observation: string = "", additional_items?: Item[], removed_items?: string[]) {
        this.id = id;
        this.name = name;
        this.observation = observation;
        this.price = price;
        this.total_price = price * quantity;
        this.size = size;
        this.quantity = quantity;
        this.group_item_id = group_item_id;
        this.category_id = category_id;
        this.product_id = product_id;
        this.additional_items = additional_items;
        this.removed_items = removed_items
    }
};