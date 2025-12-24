import { useGroupItem } from "@/app/context/group-item/context";
import Category from "@/app/entities/category/category";
import { useMemo, useState } from "react";
import Carousel from "../../carousel/carousel";
import ProductCard from "../product/card-product";
import { TextField } from "../../modal/field";
import Button from "../../ui/Button";
import GetProductByCode from "@/app/api/product/code/[code]";
import { useSession } from "next-auth/react";
import RequestError from "@/app/utils/error";
import { notifyError } from "@/app/utils/notifications";
import { useModal } from "@/app/context/modal/context";
import AddProductCard from "@/app/forms/item/form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import GetCategories from "@/app/api/category/category";
import { FiRefreshCw } from "react-icons/fi";

export const CartToAdd = () => {
    const contextGroupItem = useGroupItem();
    const [searchCode, setSearchCode] = useState("");
    const { data } = useSession();
    const modalHandler = useModal();
    const queryClient = useQueryClient();

    const { data: categoriesResponse, isFetching } = useQuery({
        queryKey: ['categories'],
        queryFn: () => GetCategories(data!),
        enabled: !!data?.user?.access_token,
    });

    const refreshCategories = () => {
        queryClient.invalidateQueries({ queryKey: ['categories'] });
    };

    const allCategories = useMemo(
        () => categoriesResponse?.items || [],
        [categoriesResponse?.items]
    );

    const categories = useMemo(() => {
        if (!allCategories.length) return [];

        if (contextGroupItem.groupItem?.category_id) {
            return allCategories.filter(
                (category) => category.id === contextGroupItem.groupItem?.category_id
            );
        }

        return allCategories.filter(
            (category) =>
                category.products &&
                category.products.length > 0 &&
                !category.is_additional &&
                !category.is_complement
        );
    }, [allCategories, contextGroupItem.groupItem?.category_id]);

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

                <button
                    onClick={refreshCategories}
                    disabled={isFetching}
                    className="p-2 rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50"
                    title="Atualizar categorias"
                >
                    <FiRefreshCw className={`w-5 h-5 ${isFetching ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <div className="text-xs text-gray-600 bg-white/70 border border-gray-200 rounded-md px-3 py-2 flex items-center gap-2">
                <span aria-hidden="true">ℹ️</span>
                <span title="Depois de escolher um item, o catálogo filtra os produtos para manter a mesma categoria e tamanho do grupo em edição.">
                    Ao selecionar um item, o catálogo mantém apenas produtos da mesma categoria e tamanho do grupo atual.
                </span>
            </div>

            <div>
                {categories?.map((category) => {
                    if (!category.products) return null;
                    let availableProductsFirst = [...(category.products ?? [])].sort(
                        (a, b) => Number(b.is_available) - Number(a.is_available)
                    );

                    if (contextGroupItem.groupItem?.size) {
                        availableProductsFirst = availableProductsFirst.filter((product) =>
                            product.size?.name === contextGroupItem.groupItem?.size
                        );
                    }
                    return (
                        <div key={category.id} className="mb-6">
                            <span className="text-lg font-semibold">{category.name}</span>
                            <hr className="mb-2" />
                            {/* Ajuste o tamanho do Carousel com responsividade */}
                            <Carousel items={availableProductsFirst}>
                                {(product) => <ProductCard key={product.id} product={product} />}
                            </Carousel>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}