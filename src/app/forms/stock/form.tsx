'use client';

import GetCompany from "@/app/api/company/company";

import React, { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TextField, CheckboxField, RadioField } from '../../components/modal/field';
import Stock, { SchemaStock } from '@/app/entities/stock/stock';
import ButtonsModal from '../../components/modal/buttons-modal';
import { useSession } from 'next-auth/react';
import CreateFormsProps from '../create-forms-props';
import UpdateStock from '@/app/api/stock/update/stock';
import NewStock from '@/app/api/stock/new/stock';
import { useModal } from '@/app/context/modal/context';
import RequestError from '@/app/utils/error';
import { notifySuccess, notifyError } from '@/app/utils/notifications';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { GetDefaultProductsByCategory } from '@/app/api/product/product';
import { GetCategoriesMap } from '@/app/api/category/category';
import { GetAllStocksWithProduct, GetStockByProductID } from '@/app/api/stock/stock';

const StockForm = ({ item, isUpdate }: CreateFormsProps<Stock>) => {
    const modalName = isUpdate ? 'edit-stock-' + item?.id : 'new-stock'
    const modalHandler = useModal();
    const queryClient = useQueryClient();
    const { data: session } = useSession();
    const [isSaving, setIsSaving] = useState(false);
    const [categoryID, setCategoryID] = useState<string>("");

    const initialValues = useMemo(() => {
        const s = new Stock(item);
        return {
            id: s.id,
            product_id: s.product_id,
            product_variation_id: s.product_variation_id || '',
            current_stock: s.current_stock.toString(),
            min_stock: s.min_stock.toString(),
            max_stock: s.max_stock.toString(),
            unit: s.unit,
            is_active: s.is_active,
        }
    }, [item]);

    const {
        handleSubmit,
        setValue,
        watch,
        formState: { errors }
    } = useForm<any>({
        resolver: zodResolver(SchemaStock),
        defaultValues: initialValues
    });

    const stock = watch();

    const onInvalid = () => {
        notifyError('Verifique os campos obrigatórios');
    };

    const { data: categoriesResponse } = useQuery({
        queryKey: ['categories', 'map', 'product'],
        queryFn: () => GetCategoriesMap(session!, true),
        enabled: !!(session as any)?.user?.access_token,
        refetchInterval: 60000,
    });

    const { data: productsResponse } = useQuery({
        queryKey: ['products', 'map', categoryID],
        queryFn: () => GetDefaultProductsByCategory(session!, categoryID, false),
        enabled: !!(session as any)?.user?.access_token && !!categoryID,
    });

    const { data: stocksResponse } = useQuery({
        queryKey: ['stocks', 'with-product'],
        queryFn: () => GetAllStocksWithProduct(session!),
        enabled: !!(session as any)?.user?.access_token && !isUpdate && !!categoryID,
        refetchInterval: 60000,
    });

    const { data: productStocksResponse } = useQuery({
        queryKey: ['stocks', 'product', stock.product_id],
        queryFn: () => GetStockByProductID(stock.product_id, session!),
        enabled: !!(session as any)?.user?.access_token && !!stock.product_id && !isUpdate,
    });

    const categories = useMemo(() => categoriesResponse || [], [categoriesResponse]);
    const products = useMemo(() => productsResponse || [], [productsResponse]);
    const stocks = useMemo(() => stocksResponse?.items || [], [stocksResponse]);
    const productStocks = useMemo(() => productStocksResponse || [], [productStocksResponse]);

    const recordProducts = useMemo(() => {
        if (isUpdate) return products.map(product => ({ id: product.id, name: product.name }));

        return products
            .filter(product => {
                const pStocks = stocks.filter(s => s.product_id === product.id);
                if (product.variations.length === 0) {
                    return !pStocks.some(s => !s.product_variation_id);
                }
                return product.variations.some(v => !pStocks.some(s => s.product_variation_id === v.id));
            })
            .map(product => ({ id: product.id, name: product.name }));
    }, [products, stocks, isUpdate]);

    const variations = useMemo(() => {
        const selectedProduct = products.find(p => p.id === stock.product_id);
        const productVariations = selectedProduct?.variations || [];
        if (isUpdate) return productVariations;
        return productVariations.filter(v => !productStocks.some(s => s.product_variation_id === v.id));
    }, [products, stock.product_id, productStocks, isUpdate]);

    const recordVariations = useMemo(() => variations.map(v => ({ id: v.id, name: v.size?.name || 'Padrão' })), [variations]);

    const createMutation = useMutation({
        mutationFn: (newStock: Stock) => NewStock(newStock, session!),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['stocks'] });
            notifySuccess(`Controle de estoque criado com sucesso`);
            modalHandler.hideModal(modalName);
        },
        onError: (error: RequestError) => {
            notifyError(error.message || 'Erro ao criar estoque');
        },
        onSettled: () => setIsSaving(false)
    });

    const updateMutation = useMutation({
        mutationFn: (updatedStock: Stock) => UpdateStock(updatedStock, session!),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['stocks'] });
            notifySuccess(`Estoque atualizado com sucesso`);
            modalHandler.hideModal(modalName);
        },
        onError: (error: RequestError) => {
            notifyError(error.message || 'Erro ao atualizar estoque');
        },
        onSettled: () => setIsSaving(false)
    });

    const submit = async (formData: any) => {
        if (!session) return;
        setIsSaving(true);
        const stockToSave = new Stock(formData);
        if (isUpdate) {
            updateMutation.mutate(stockToSave);
        } else {
            createMutation.mutate(stockToSave);
        }
    }

    return (
        <div className="text-black space-y-6">
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-lg shadow-sm border border-gray-100 p-6 transition-all duration-300 hover:shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Produto</h3>
                <div className="transform transition-transform duration-200 hover:scale-[1.01]">
                    {!isUpdate && <RadioField
                        friendlyName="Categoria"
                        name="category_id"
                        selectedValue={categoryID}
                        setSelectedValue={setCategoryID}
                        values={categories}
                        error={errors.category_id?.message as string}
                    />}

                    {!isUpdate && <RadioField
                        friendlyName="Produto"
                        name="product_id"
                        selectedValue={stock.product_id}
                        setSelectedValue={(value: any) => {
                            setValue('product_id', value);
                            setValue('product_variation_id', '');
                        }}
                        values={recordProducts}
                        error={errors.product_id?.message as string}
                    />}

                    {!isUpdate && variations.length > 0 && <RadioField
                        friendlyName="Variação / Tamanho"
                        name="product_variation_id"
                        selectedValue={stock.product_variation_id || ""}
                        setSelectedValue={(value: any) => setValue('product_variation_id', value)}
                        values={recordVariations}
                        error={errors.product_variation_id?.message as string}
                    />}

                    {isUpdate && <TextField
                        friendlyName="Produto"
                        name="product_id"
                        setValue={(value: any) => setValue('product_id', value)}
                        value={item?.product?.name || ""}
                        disabled
                    />}

                    {isUpdate && stock.product_variation_id && <TextField
                        friendlyName="Variação / Tamanho"
                        name="product_variation_id"
                        setValue={(value: any) => setValue('product_variation_id', value)}
                        value={item?.product?.variations?.find(v => v.id === stock.product_variation_id)?.size?.name || "Padrão"}
                        disabled
                    />}
                </div>
            </div>

            <div className="bg-gradient-to-br from-white to-green-50 rounded-lg shadow-sm border border-green-100 p-6 transition-all duration-300 hover:shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-green-200">Níveis de Estoque</h3>
                <div className="space-y-4">
                    {!isUpdate && <div className="transform transition-transform duration-200 hover:scale-[1.01]">
                        <TextField
                            friendlyName="Estoque Atual"
                            name="current_stock"
                            setValue={(value: any) => setValue('current_stock', value)}
                            value={stock.current_stock}
                            error={errors.current_stock?.message as string}
                        />
                    </div>}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 transform transition-transform duration-200 hover:scale-[1.01]">
                            <TextField
                                friendlyName="Estoque Mínimo"
                                name="min_stock"
                                setValue={(value: any) => setValue('min_stock', value)}
                                value={stock.min_stock}
                                error={errors.min_stock?.message as string}
                            />
                        </div>
                        <div className="flex-1 transform transition-transform duration-200 hover:scale-[1.01]">
                            <TextField
                                friendlyName="Estoque Máximo"
                                name="max_stock"
                                setValue={(value: any) => setValue('max_stock', value)}
                                value={stock.max_stock}
                                error={errors.max_stock?.message as string}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-gradient-to-br from-white to-blue-50 rounded-lg shadow-sm border border-blue-100 p-6 transition-all duration-300 hover:shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-blue-200">Configurações</h3>
                <div className="space-y-4">
                    <div className="transform transition-transform duration-200 hover:scale-[1.01]">
                        <TextField
                            friendlyName="Unidade"
                            name="unit"
                            setValue={(value: any) => setValue('unit', value)}
                            value={stock.unit}
                            placeholder="ex: unidades, kg, litros"
                            error={errors.unit?.message as string}
                        />
                    </div>
                    <div className="transform transition-transform duration-200 hover:scale-[1.01]">
                        <CheckboxField
                            friendlyName="Controle Ativo"
                            name="is_active"
                            setValue={(value: any) => setValue('is_active', value)}
                            value={stock.is_active}
                            error={errors.is_active?.message as string}
                        />
                    </div>
                </div>
            </div>

            <ButtonsModal
                item={stock}
                name="stock"
                onSubmit={handleSubmit(submit, onInvalid)}
                isPending={isSaving}
            />
        </div>
    )
}

export default StockForm;