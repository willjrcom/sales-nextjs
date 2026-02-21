'use client';

import { useMemo, useState } from 'react';
import { TextField, CheckboxField, RadioField } from '../../components/modal/field';
import Stock, { ValidateStockForm } from '@/app/entities/stock/stock';
import ButtonsModal from '../../components/modal/buttons-modal';
import { useSession } from 'next-auth/react';
import CreateFormsProps from '../create-forms-props';
import UpdateStock from '@/app/api/stock/update/stock';
import NewStock from '@/app/api/stock/new/stock';
import { useModal } from '@/app/context/modal/context';
import ErrorForms from '../../components/modal/error-forms';
import RequestError from '@/app/utils/error';
import { notifySuccess, notifyError } from '@/app/utils/notifications';
import Decimal from 'decimal.js';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { GetDefaultProductsByCategory } from '@/app/api/product/product';
import { GetCategoriesMap } from '@/app/api/category/category';
import { GetAllStocksWithProduct, GetStockByProductID } from '@/app/api/stock/stock';

const StockForm = ({ item, isUpdate }: CreateFormsProps<Stock>) => {
    const modalName = isUpdate ? 'edit-stock-' + item?.id : 'new-stock'
    const modalHandler = useModal();
    const [stock, setStock] = useState<Stock>(new Stock(item));
    const { data } = useSession();
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const [categoryID, setCategoryID] = useState<string>("");
    const queryClient = useQueryClient();

    const { data: categoriesResponse } = useQuery({
        queryKey: ['categories', 'map', 'product'],
        queryFn: () => GetCategoriesMap(data!, true),
        enabled: !!(data as any)?.user?.access_token,
        refetchInterval: 60000,
    });

    const { data: productsResponse } = useQuery({
        queryKey: ['products', 'map', categoryID],
        queryFn: () => GetDefaultProductsByCategory(data!, categoryID, false),
        enabled: !!(data as any)?.user?.access_token && !!categoryID,
    });

    const { data: stocksResponse } = useQuery({
        queryKey: ['stocks', 'with-product'],
        queryFn: () => GetAllStocksWithProduct(data!),
        enabled: !!(data as any)?.user?.access_token && !isUpdate && !!categoryID, // Fetch all for filtering the product list
        refetchInterval: 60000,
    });

    const { data: productStocksResponse } = useQuery({
        queryKey: ['stocks', 'product', stock.product_id],
        queryFn: () => GetStockByProductID(stock.product_id, data!),
        enabled: !!(data as any)?.user?.access_token && !!stock.product_id && !isUpdate,
    });

    const categories = useMemo(() => categoriesResponse || [], [categoriesResponse]);
    const products = useMemo(() => productsResponse || [], [productsResponse]);
    const stocks = useMemo(() => stocksResponse?.items || [], [stocksResponse]);
    const productStocks = useMemo(() => productStocksResponse || [], [productStocksResponse]);

    const recordProducts = useMemo(() => {
        if (isUpdate) return products.map(product => ({ id: product.id, name: product.name }));

        return products
            .filter(product => {
                const productStocks = stocks.filter(s => s.product_id === product.id);

                // Se o produto não tem variações, ele não deve estar no estoque
                if (product.variations.length === 0) {
                    return !productStocks.some(s => !s.product_variation_id);
                }

                // Se o produto tem variações, pelo menos uma variação não deve estar no estoque
                return product.variations.some(v => !productStocks.some(s => s.product_variation_id === v.id));
            })
            .map(product => ({ id: product.id, name: product.name }));
    }, [products, stocks, isUpdate]);

    const variations = useMemo(() => {
        const selectedProduct = products.find(p => p.id === stock.product_id);
        const productVariations = selectedProduct?.variations || [];

        if (isUpdate) return productVariations;

        // Use specific product stocks for more accurate variation filtering
        return productVariations.filter(v => !productStocks.some(s => s.product_variation_id === v.id));
    }, [products, stock.product_id, productStocks, isUpdate]);

    const recordVariations = useMemo(() => variations.map(v => ({ id: v.id, name: v.size?.name || 'Padrão' })), [variations]);

    const createMutation = useMutation({
        mutationFn: (newStock: Stock) => NewStock(newStock, data!),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['stocks'] });
            notifySuccess(`Controle de estoque criado com sucesso`);
            modalHandler.hideModal(modalName);
        },
        onError: (error: RequestError) => {
            notifyError(error.message || 'Erro ao criar estoque');
        }
    });

    const updateMutation = useMutation({
        mutationFn: (updatedStock: Stock) => UpdateStock(updatedStock, data!),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['stocks'] });
            notifySuccess(`Estoque atualizado com sucesso`);
            modalHandler.hideModal(modalName);
        },
        onError: (error: RequestError) => {
            notifyError(error.message || 'Erro ao atualizar estoque');
        }
    });

    const handleInputChange = (field: keyof Stock, value: any) => {
        setStock(prev => ({ ...prev, [field]: value }));
    };

    const handleDecimalChange = (field: keyof Stock, value: string) => {
        const sanitized = value.replace(/[^\d.-]/g, '').trim();
        const decimalValue = sanitized === '' || sanitized === '-' ? new Decimal(0) : new Decimal(sanitized);
        handleInputChange(field, decimalValue);
    };

    const submit = async () => {
        if (!data) return;
        const validationErrors = ValidateStockForm(stock);
        if (Object.values(validationErrors).length > 0) return setErrors(validationErrors);

        if (isUpdate) {
            updateMutation.mutate(stock);
        } else {
            createMutation.mutate(stock);
        }
    }

    return (
        <div className="text-black space-y-6">
            {/* Seção: Produto */}
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-lg shadow-sm border border-gray-100 p-6 transition-all duration-300 hover:shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Produto</h3>
                <div className="transform transition-transform duration-200 hover:scale-[1.01]">
                    {!isUpdate && <RadioField
                        friendlyName="Categoria"
                        name="category_id"
                        selectedValue={categoryID}
                        setSelectedValue={setCategoryID}
                        values={categories}
                    />}

                    {!isUpdate && <RadioField
                        friendlyName="Produto"
                        name="product_id"
                        selectedValue={stock.product_id}
                        setSelectedValue={(value) => {
                            handleInputChange('product_id', value);
                            handleInputChange('product_variation_id', '');
                        }}
                        values={recordProducts}
                    />}

                    {!isUpdate && variations.length > 0 && <RadioField
                        friendlyName="Variação / Tamanho"
                        name="product_variation_id"
                        selectedValue={stock.product_variation_id || ""}
                        setSelectedValue={(value) => handleInputChange('product_variation_id', value)}
                        values={recordVariations}
                    />}

                    {isUpdate && <TextField
                        friendlyName="Produto"
                        name="product_id"
                        setValue={(value) => handleInputChange('product_id', value)}
                        value={stock.product?.name || ""}
                        disabled
                    />}

                    {isUpdate && stock.product_variation_id && <TextField
                        friendlyName="Variação / Tamanho"
                        name="product_variation_id"
                        setValue={(value) => handleInputChange('product_variation_id', value)}
                        value={stock.product?.variations?.find(v => v.id === stock.product_variation_id)?.size?.name || "Padrão"}
                        disabled
                    />}
                </div>
            </div>

            {/* Seção: Níveis de Estoque */}
            <div className="bg-gradient-to-br from-white to-green-50 rounded-lg shadow-sm border border-green-100 p-6 transition-all duration-300 hover:shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-green-200">Níveis de Estoque</h3>
                <div className="space-y-4">
                    {!isUpdate && <div className="transform transition-transform duration-200 hover:scale-[1.01]">
                        <TextField
                            friendlyName="Estoque Atual"
                            name="current_stock"
                            setValue={(value) => handleDecimalChange('current_stock', value)}
                            value={stock.current_stock.toString()}
                        />
                    </div>}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 transform transition-transform duration-200 hover:scale-[1.01]">
                            <TextField
                                friendlyName="Estoque Mínimo"
                                name="min_stock"
                                setValue={(value) => handleDecimalChange('min_stock', value)}
                                value={stock.min_stock.toString()}
                            />
                        </div>
                        <div className="flex-1 transform transition-transform duration-200 hover:scale-[1.01]">
                            <TextField
                                friendlyName="Estoque Máximo"
                                name="max_stock"
                                setValue={(value) => handleDecimalChange('max_stock', value)}
                                value={stock.max_stock.toString()}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Seção: Configurações */}
            <div className="bg-gradient-to-br from-white to-blue-50 rounded-lg shadow-sm border border-blue-100 p-6 transition-all duration-300 hover:shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-blue-200">Configurações</h3>
                <div className="space-y-4">
                    <div className="transform transition-transform duration-200 hover:scale-[1.01]">
                        <TextField
                            friendlyName="Unidade"
                            name="unit"
                            setValue={(value) => handleInputChange('unit', value)}
                            value={stock.unit}
                            placeholder="ex: unidades, kg, litros"
                        />
                    </div>
                    <div className="transform transition-transform duration-200 hover:scale-[1.01]">
                        <CheckboxField
                            friendlyName="Controle Ativo"
                            name="is_active"
                            setValue={(value) => handleInputChange('is_active', value)}
                            value={stock.is_active}
                        />
                    </div>
                </div>
            </div>

            <ErrorForms errors={errors} setErrors={setErrors} />

            <ButtonsModal
                item={stock}
                name="stock"
                onSubmit={submit}
            />
        </div>
    )
}

export default StockForm; 