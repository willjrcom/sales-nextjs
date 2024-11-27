class ItemCommonAttributes {
    name: string = "";
    description: string = "";
    observation: string = "";
    price: number = 0;
    total_price: number = 0;
    size: string = "";
    quantity: number = 0;
    group_item_id: string = "";
    additional_items?: Item[] = [];
    product_id: string = "";
};

export default class Item extends ItemCommonAttributes {
    id: string = "";
};