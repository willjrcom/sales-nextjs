import { useGroupItem } from "@/app/context/group-item/context";
import Category from "@/app/entities/category/category";
import { RootState } from "@/redux/store";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Carousel from "../../carousel/carousel";
import ProductCard from "../product/card-product";
import Refresh from "../../crud/refresh";
import { fetchCategories } from "@/redux/slices/categories";

export const CartToAdd = () => {
    const categoriesSlice = useSelector((state: RootState) => state.categories);
    const [categories, setCategories] = useState<Category[]>(Object.values(categoriesSlice.entities));
    const contextGroupItem = useGroupItem();

    useEffect(() => {
        // Show only group item category
        if (contextGroupItem.groupItem?.category_id) {
            const filteredCategories = categories.filter((category) =>
                category.id === contextGroupItem.groupItem?.category_id
            )
            setCategories(filteredCategories);
            return
        }

        // Show all categories less additional and complement
        const filteredCategories = Object.values(categoriesSlice.entities)
            .filter((category) => category.products
                && category.products.length > 0
                && !category.is_additional
                && !category.is_complement
            );
        setCategories(filteredCategories);
    }, [contextGroupItem.groupItem?.category_id])

    return (
        <div className=" flex-auto p-4 bg-gray-100 space-y-3 mr-4 overflow-y-auto h-full">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Carrinho</h1>
                <Refresh slice={categoriesSlice} fetchItems={fetchCategories} />
            </div>
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