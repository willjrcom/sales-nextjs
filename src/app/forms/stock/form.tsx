'use client';

import React, { useEffect, useState } from 'react';
import { TextField, CheckboxField } from '../../components/modal/field';
import Stock, { ValidateStockForm } from '@/app/entities/stock/stock';
import ButtonsModal from '../../components/modal/buttons-modal';
import { useSession } from 'next-auth/react';
import Product from '@/app/entities/product/product';
import CreateFormsProps from '../create-forms-props';
import UpdateStock from '@/app/api/stock/update/stock';
import NewStock from '@/app/api/stock/new/stock';
import { useModal } from '@/app/context/modal/context';
import ErrorForms from '../../components/modal/error-forms';
import RequestError from '@/app/utils/error';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { SelectField } from '@/app/components/modal/field';
import { notifySuccess, notifyError } from '@/app/utils/notifications';
import Decimal from 'decimal.js';
import { addStock, fetchReportStocks, updateStock } from '@/redux/slices/stock';

const StockForm = ({ item, isUpdate }: CreateFormsProps<Stock>) => {
    const modalName = isUpdate ? 'edit-stock-' + item?.id : 'new-stock'
    const modalHandler = useModal();
    const categoriesSlice = useSelector((state: RootState) => state.categories);
    const [stock, setStock] = useState<Stock>(item || new Stock());
    const [products, setProducts] = useState<Product[]>([]);
    const [recordProducts, setRecordProducts] = useState<{ id: string; name: string; }[]>([]);
    const { data } = useSession();
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const dispatch = useDispatch<AppDispatch>();

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

        try {
            if (isUpdate) {
                await UpdateStock(stock, data);
                dispatch(updateStock({ type: "UPDATE", payload: {id: stock.id, changes: stock}}));
                dispatch(fetchReportStocks({ session: data }))
                notifySuccess(`Estoque atualizado com sucesso`);
            } else {
                await NewStock(stock, data);
                dispatch(addStock({...stock}));
                dispatch(fetchReportStocks({ session: data }))
                notifySuccess(`Controle de estoque criado com sucesso`);
            }
            
            modalHandler.hideModal(modalName);

        } catch (error) {
            const err = error as RequestError;
            notifyError(err.message || 'Erro ao salvar estoque');
        }
    }

    useEffect(() => {
        const LoadProducts = async () => {
            if (!data) return;

            try {
                // Buscar produtos de todas as categorias
                const allProducts = Object.values(categoriesSlice.entities)
                    .map((category) => {
                        return category.products?.map(product => ({
                            ...product,
                            category: category,
                        } as Product)) || []
                    }).flat();

                setProducts(allProducts);

                let records: { id: string; name: string; }[] = [];

                if (allProducts.length === 0) {
                    setRecordProducts([]);
                    return;
                }

                for (const product of allProducts) {
                    records.push({ id: product.id, name: product.name + " - " + product.size.name })
                }
                setRecordProducts(records);

            } catch (error: RequestError | any) {
                notifyError(error);
            }
        }

        LoadProducts();
    }, [data?.user.access_token, categoriesSlice.entities]);

    return (
        <div className="text-black space-y-6">
            {/* Seção: Produto */}
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-lg shadow-sm border border-gray-100 p-6 transition-all duration-300 hover:shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Produto</h3>
                <div className="transform transition-transform duration-200 hover:scale-[1.01]">
                    <SelectField
                        friendlyName="Produto"
                        name="product_id"
                        selectedValue={stock.product_id}
                        setSelectedValue={(value) => handleInputChange('product_id', value)}
                        values={recordProducts}
                    />
                </div>
            </div>

            {/* Seção: Níveis de Estoque */}
            <div className="bg-gradient-to-br from-white to-green-50 rounded-lg shadow-sm border border-green-100 p-6 transition-all duration-300 hover:shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-green-200">Níveis de Estoque</h3>
                <div className="space-y-4">
                    <div className="transform transition-transform duration-200 hover:scale-[1.01]">
                        <TextField
                            friendlyName="Estoque Atual"
                            name="current_stock"
                            setValue={(value) => handleDecimalChange('current_stock', value)}
                            value={stock.current_stock.toString()}
                        />
                    </div>
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

export default StockForm 