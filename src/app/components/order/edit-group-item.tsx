import { useCategories } from "@/app/context/category/context";
import CarouselProducts from "./carousel";
import ItemCard from "./card-item";
import { useGroupItem} from "@/app/context/group-item/context";
import { useEffect } from "react";
import { useCurrentOrder } from "@/app/context/current-order/context";

export default function EditGroupItem() {
    return (
        <div className="flex h-[70vh] bg-gray-200 p-4 overflow-hidden">
            <ListCart />
            <ListGroupItem />
        </div >
    );
}

const ListCart = () => {
    const contextCategory = useCategories();

    return (
        <div className="flex-1 p-4 bg-gray-100 space-y-6 mr-4 overflow-y-auto">
            <h1 className="text-2xl font-bold">Produtos</h1>
            <div>
                {contextCategory.items.map((category) => {
                    if (!category.products) return;
                    return (
                        <div key={category.id} className="mb-6">
                            <hr className="mb-2" />
                            <span className="text-lg font-semibold">{category.name}</span>
                            <CarouselProducts products={category.products} />
                        </div>
                    );
                })}
            </div>
        </div>
    )
}

const ListGroupItem = () => {
    const contextGroupItem = useGroupItem();
    const contextCurrentOrder = useCurrentOrder();

    useEffect(() => {
        if (contextGroupItem.groupItem?.items.length === 0) {
            contextGroupItem.resetGroupItem()
        } else if (contextGroupItem.groupItem) {
            contextCurrentOrder.updateGroupItem(contextGroupItem.groupItem)
        }
    }, [contextGroupItem.groupItem])

    return (
        < div className="w-80 bg-gray-100 p-4 space-y-4 overflow-y-auto" >
            <h2 className="text-xl font-semibold">Produtos selecionados</h2>

            {/* Produto Selecionado */}
            <div className="space-y-2">
                {contextGroupItem.groupItem?.items.map((item, index) => (
                    <ItemCard item={item} key={index}/>
                ))}
            </div>

            {/* Total e Botão */}
            <div>
                <p className="text-xl font-bold">R$ {contextGroupItem.groupItem?.total_price.toFixed(2) || "0,00"}</p>
            </div>
        </div >
    )
}