import GroupItem from "@/app/entities/order/group-item"
import Category from "@/app/entities/category/category";
import GroupItemCard from "../group-item/card-group-item";
import Carousel from "../../carousel/carousel";

interface CategoryOrderProps {
    category: Category;
    groupItems: GroupItem[];
}

const CategoryOrder = ({ groupItems, category }: CategoryOrderProps) => {
    return (
        <div className="mb-6 bg-gray-100 p-4">
            {/* Título da categoria com botão de edição */}
            <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold">{category.name}</h2>
                <p className="text-right mt-2">Subtotal: R$ {groupItems?.reduce((total, group) => total + group.total_price, 0).toFixed(2)}</p>
            </div>
            <hr />
            <br />

            {/* Container para grupos com scroll horizontal */}
            <div className="overflow-x-auto">
                <div className=" space-x-4">
                    <Carousel items={groupItems}>
                        {(group) => (
                            <GroupItemCard key={group.id} groupItem={group} />
                        )}
                    </Carousel>
                </div>
            </div>
        </div>
    );
};

export default CategoryOrder;
