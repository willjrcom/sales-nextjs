import { GroupItem } from "@/app/entities/order/group-item"
import GroupItemOrder from "./group-item"

interface CategoryOrderProps {
    groups: GroupItem[]
}

const CategoryOrder = ({groups}: CategoryOrderProps) => {
    return (
        <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold">Pizza</h2>
            <button className="text-blue-500 underline">Editar</button>
        </div>
        {/* Scroll horizontal */}
        <div className="overflow-x-auto">
            <div className="inline-flex space-x-4">
                {groups.map((group, index) => (
                    <GroupItemOrder key={index} items={group.items} />
                ))}
            </div>
        </div>
        <hr />
        <p className="text-right mt-2">Subtotal: R$ 120,00</p>
    </div>
    )
}

export default CategoryOrder