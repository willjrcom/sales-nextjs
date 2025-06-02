"use client";
import GroupItem from "@/app/entities/order/group-item"
import Category from "@/app/entities/category/category";
import Decimal from 'decimal.js';
import GroupItemCard from "../group-item/card-group-item";
import Carousel from "../../carousel/carousel";

interface CategoryOrderProps {
    category: Category;
    groupItems: GroupItem[];
}

const CategoryOrder = ({ groupItems, category }: CategoryOrderProps) => {
    return (
        <div className="mb-6 bg-gray-100 p-4 box-border max-w-[100vw]">
            {/* Título da categoria com botão de edição */}
            <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold">{category.name}</h2>
                <p className="text-right mt-2">
                    Subtotal: R$ {groupItems?.reduce(
                        (total: Decimal, group) => new Decimal(total).plus(new Decimal(group.total_price)),
                        new Decimal(0)
                    ).toFixed(2)}
                </p>
            </div>
            <hr className="my-4" />

            {/* Carousel de grupos de itens */}
            <Carousel items={groupItems}>
                {(group) => (
                    <GroupItemCard key={group.id} groupItem={group} />
                )}
            </Carousel>
        </div>
    );
};

export default CategoryOrder;
