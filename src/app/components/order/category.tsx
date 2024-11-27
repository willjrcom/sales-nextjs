import GroupItem from "@/app/entities/order/group-item"
import Category from "@/app/entities/category/category";
import GroupItemCard from "./card-group-item";

interface CategoryOrderProps {
    category: Category;
    groups: GroupItem[]
}

const CategoryOrder = ({ groups, category }: CategoryOrderProps) => {
    return (
        <div className="mb-6 bg-gray-100 p-4">
            {/* Título da categoria com botão de edição */}
            <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold">{category.name}</h2>
                <p className="text-right mt-2">Subtotal: R$ {groups?.reduce((total, group) => total + group.total_price, 0).toFixed(2)}</p>
            </div>

            {/* Container para grupos com scroll horizontal */}
            <div className="overflow-x-auto">
                <div className="flex space-x-4">
                    {groups.map((group, index) => (
                        <GroupItemCard key={index} groupItem={group} />
                    ))}
                </div>
            </div>
        </div>
    );
};


export default CategoryOrder