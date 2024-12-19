import { useGroupItem } from "@/app/context/group-item/context";
import Category from "@/app/entities/category/category";
import { RootState } from "@/redux/store";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Carousel from "../../carousel/carousel";
import ProductCard from "../product/card-product";

export const CartToAdd = () => {
    const categoriesSlice = useSelector((state: RootState) => state.categories);
    const [categories, setCategories] = useState<Category[]>(Object.values(categoriesSlice.entities));
    const contextGroupItem = useGroupItem();

    useEffect(() => {
        if (contextGroupItem.groupItem?.category_id) {
            setCategories(categories.filter((category) => category.id === contextGroupItem.groupItem?.category_id));
            return
        }

        setCategories(Object.values(categoriesSlice.entities));
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