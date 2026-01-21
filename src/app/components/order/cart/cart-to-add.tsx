import { useMemo, useState } from "react";
import Carousel from "../../carousel/carousel";
import ProductCard from "../product/card-product";
import { TextField } from "../../modal/field";
import GetProductByCode from "@/app/api/product/code/[code]";
import { useSession } from "next-auth/react";
import RequestError from "@/app/utils/error";
import { notifyError } from "@/app/utils/notifications";
import { useModal } from "@/app/context/modal/context";
import AddProductCard from "@/app/forms/item/form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { GetDefaultProducts } from "@/app/api/product/product";
import Refresh from "../../crud/refresh";
import GroupItem from "@/app/entities/order/group-item";
import CartDrawerButton from "./cart-modal";

export const CartToAdd = () => {
    const [searchCode, setSearchCode] = useState("");
    const { data } = useSession();
    const modalHandler = useModal();
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
    const queryClient = useQueryClient();

    const groupItem = queryClient.getQueryData<GroupItem | null>(['group-item', 'current']);

    const { isPending, data: productsResponse, refetch } = useQuery({
        queryKey: ['products', 'default', pagination.pageIndex, pagination.pageSize],
        queryFn: () => GetDefaultProducts(data!, pagination.pageIndex, pagination.pageSize, true),
        enabled: !!data?.user?.access_token,
    });

    const products = useMemo(() => productsResponse?.items || [], [productsResponse?.items]);

    const productsFiltered = useMemo(() => {
        if (!products.length) return [];

        if (groupItem?.category_id) {
            return products.filter((product) => product.category_id === groupItem.category_id && product.size?.name === groupItem.size);
        }

        return products;
    }, [products, groupItem?.category_id, groupItem?.size]);

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
                    <Button onClick={onSearch} variant="outline">Buscar</Button>
                </div>

                <div className="flex items-center space-x-2">
                    <CartDrawerButton />

                    <Refresh
                        onRefresh={refetch}
                        isPending={isPending}
                    />
                </div>
            </div>

            <div className="text-xs text-gray-600 bg-white/70 border border-gray-200 rounded-md px-3 py-2 flex items-center gap-2">
                <span aria-hidden="true">ℹ️</span>
                <span title="Depois de escolher um item, o catálogo filtra os produtos para manter a mesma categoria e tamanho do grupo em edição.">
                    Ao selecionar um item, o catálogo mantém apenas produtos da mesma categoria e tamanho do grupo atual.
                </span>
            </div>

            <Carousel items={productsFiltered}>
                {(product) => <ProductCard key={product.id} product={product} />}
            </Carousel>
        </div>
    );
}