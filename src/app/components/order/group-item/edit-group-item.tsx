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
import ButtonIconText from "../../button/button-icon-text";
import ComplementItemList from "./list-complement-item";
import ComplementItemCard from "./complement-item";
import Item from "@/app/entities/order/item";

export default function EditGroupItem() {
    return (
        <div className="flex h-[68vh]">
            {/* Componente à esquerda: ocupa 70% da tela */}
            <ListCartToAdd />
            <ListGroupItem />
        </div>
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
    }, [contextGroupItem.groupItem?.category_id])

    return (
        <div className="max-w-[60vw] flex-auto p-4 bg-gray-100 space-y-3 mr-4 overflow-y-auto h-full">
            <h1 className="text-2xl font-bold">Carrinho</h1>
            <div>
                {categories?.map((category) => {
                    if (!category.products) return null;
                    return (
                        <div key={category.id} className="mb-6">
                            <span className="text-lg font-semibold">{category.name}</span>
                            <hr className="mb-2" />
                            {/* Ajuste o tamanho do Carousel com responsividade */}
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
    const [complementItem, setComplementItem] = useState<Item | null>();

    useEffect(() => {
        setGroupItem(contextGroupItem.groupItem);
        
        if (contextGroupItem.groupItem?.complement_item) {
            setComplementItem(contextGroupItem.groupItem.complement_item)
        } else {
            setComplementItem(null)
        }
    }, [contextGroupItem.groupItem]);

    return (
        <div className="bg-gray-100 p-3 space-y-4 overflow-y-auto h-full lg:block hidden lg:w-[30vw]">
            {/* Defina o min-h para o tamanho mínimo em telas pequenas, e lg:block para visibilidade em telas grandes */}
            <h2 className="text-xl font-semibold">Produtos selecionados</h2>

            {/* Produto Selecionado */}
            <div className="space-y-2">
                {groupItem?.items?.map((item) => (
                    <ItemCard item={item} key={item.id} />
                ))}
            </div>

            {/* Adicionar complemento */}
            <p className="text-lg font-semibold">Complemento</p>
            {!complementItem && <ButtonIconText size="md" title="Adicionar complemento" modalName={"add-complement-item-group-item-" + groupItem?.id} onCloseModal={() => contextGroupItem.fetchData(groupItem?.id || "")}>
                <ComplementItemList groupItem={groupItem} />
            </ButtonIconText>}

            {complementItem && 
                <ComplementItemCard item={groupItem} />
            }

            <div className="flex justify-between items-center">
                <p className="text-lg font-bold">Total:</p>
                <p className="text-xl font-bold">R$ {groupItem?.total_price.toFixed(2) || "0,00"}</p>
            </div>
            <hr className="my-4" />
            
            {groupItem?.status && <p><strong>Status:</strong> <StatusComponent status={groupItem.status} /></p>}
            {groupItem?.status == "Staging" as StatusGroupItem && 
                <GroupItemForm item={groupItem} />
            }
        </div>
    );
}