import { useGroupItem } from "@/app/context/group-item/context";
import Category from "@/app/entities/category/category";
import { RootState } from "@/redux/store";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Carousel from "../../carousel/carousel";
import ProductCard from "../product/card-product";
import Refresh from "../../crud/refresh";
import { fetchCategories } from "@/redux/slices/categories";
import { TextField } from "../../modal/field";
import Button from "../../ui/Button";
import GetProductByCode from "@/app/api/product/code/[code]";
import { useSession } from "next-auth/react";
import RequestError from "@/app/utils/error";
import { notifyError } from "@/app/utils/notifications";
import { useModal } from "@/app/context/modal/context";
import AddProductCard from "@/app/forms/item/form";

export const CartToAdd = () => {
    const categoriesSlice = useSelector((state: RootState) => state.categories);
    const [categories, setCategories] = useState<Category[]>(Object.values(categoriesSlice.entities));
    const contextGroupItem = useGroupItem();
    const [searchCode, setSearchCode] = useState("");
    const { data } = useSession();
    const modalHandler = useModal();

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

    const onSearch = async () => {
        if (!data) return

        try {
            const product = await GetProductByCode(searchCode, data);
            const modalName = `add-item-${product.id}`
            const onClose = () => {
                modalHandler.hideModal(modalName);
            }
            
            modalHandler.showModal(modalName, "", <AddProductCard product={product} />, "md", onClose)
        } catch (error: RequestError | any) {
            notifyError(error.message || "Erro ao buscar produto por codigo: " + searchCode);
        }
    }

    return (
        <div className=" flex-auto p-4 bg-gray-100 space-y-3 mr-4 overflow-y-auto h-full">
            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                    <TextField placeholder="Pesquisar por codigo"
                        name="search"
                        setValue={setSearchCode}
                        value={searchCode}
                        friendlyName="Busca por codigo"
                        key="search"
                        onEnter={onSearch}
                        optional
                    />
                    <Button onClick={onSearch}>Buscar</Button>
                </div>

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