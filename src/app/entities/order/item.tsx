export interface Item extends ItemCommonAttributes{
    id: string;
};

interface ItemCommonAttributes {
    name: string;
    description: string;
    observation: string;
    price: number;
    total_price: number;
    size: string;
    quantity: number;
    group_item_id: string;
    additional_items?: Item[];
    product_id: string;
};
