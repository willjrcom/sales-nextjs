import { useCategories } from "@/app/context/category/context";
import Carousel from "../../carousel/carousel";
import { useGroupItem } from "@/app/context/group-item/context";
import { useEffect, useState } from "react";
import ItemCard from "../item/card-item";
import GroupItem, { StatusGroupItem } from "@/app/entities/order/group-item";
import Category from "@/app/entities/category/category";
import GroupItemForm from "@/app/forms/group-item/form";
import StatusComponent from "../../button/show-status";
import ProductCard from "../product/card-product";

export default function EditGroupItem() {
    return (
        <div className="flex h-[68vh] bg-gray-200 p-4 overflow-hidden">
            <ListCartToAdd />
            <ListGroupItem />
        </div >
    );
}

const ListCartToAdd = () => {
    const allCategories = useCategories().items
    const [categories, setCategories] = useState<Category[]>(allCategories);
    const contextGroupItem = useGroupItem();

    useEffect(() => {
        if (contextGroupItem.groupItem?.category_id) {
            setCategories(categories.filter((category) => category.id === contextGroupItem.groupItem?.category_id));
            return
        }

        setCategories(allCategories);
    }, [contextGroupItem.groupItem])

    return (
        <div className="max-w-[70vw] flex-1 p-4 bg-gray-100 space-y-6 mr-4 overflow-y-auto">
            <h1 className="text-2xl font-bold">Produtos</h1>
            <div>
                {categories?.map((category) => {
                    if (!category.products) return null; // Verificação para garantir que há produtos
                    return (
                        <div key={category.id} className="mb-6">
                            <hr className="mb-2" />
                            <span className="text-lg font-semibold">{category.name}</span>
                            <Carousel items={category.products}>
                                {(product) => <ProductCard key={product.id} product={product} />}
                            </Carousel>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

const ListGroupItem = () => {
    const contextGroupItem = useGroupItem();
    const [groupItem, setGroupItem] = useState<GroupItem | null>(contextGroupItem.groupItem);

    useEffect(() => {
        setGroupItem(contextGroupItem.groupItem);
    }, [contextGroupItem.groupItem]);
    
    return (
        < div className="max-w-[30vw] bg-gray-100 p-4 space-y-4 overflow-y-auto" >
            <h2 className="text-xl font-semibold">Produtos selecionados</h2>

            {/* Produto Selecionado */}
            <div className="space-y-2">
                {contextGroupItem.groupItem?.items?.map((item, index) => (
                    <ItemCard item={item} key={index} />
                ))}
            </div>

            <p className="text-xl font-bold">R$ {groupItem?.total_price.toFixed(2) || "0,00"}</p>
            {groupItem?.status && <p><strong>Status:</strong> <StatusComponent status={groupItem.status} /></p>}
            {groupItem?.status == "Staging" as StatusGroupItem && 
                <GroupItemForm item={groupItem} />
            }
        </div>
    )
}