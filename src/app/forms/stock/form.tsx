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
import { updateCategory } from '@/redux/slices/categories';
import { SelectField } from '@/app/components/modal/field';
import { notifySuccess, notifyError } from '@/app/utils/notifications';
import Decimal from 'decimal.js';
import { addStock, updateStock } from '@/redux/slices/stock';

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

    const submit = async () => {
        if (!data) return;
        const validationErrors = ValidateStockForm(stock);
        if (Object.values(validationErrors).length > 0) return setErrors(validationErrors);

        try {
            if (isUpdate) {
                await UpdateStock(stock, data);
                dispatch(updateStock({ type: "UPDATE", payload: {id: stock.id, changes: stock}}));
                notifySuccess(`Estoque atualizado com sucesso`);
            } else {
                await NewStock(stock, data);
                dispatch(addStock({...stock}));
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
                    records.push({ id: product.id, name: product.name })
                }
                setRecordProducts(records);

            } catch (error: RequestError | any) {
                notifyError(error);
            }
        }

        LoadProducts();
    }, [data?.user.access_token, categoriesSlice.entities]);

    return (
        <>
            <SelectField
                friendlyName="Produto"
                name="product_id"
                selectedValue={stock.product_id}
                setSelectedValue={(value) => handleInputChange('product_id', value)}
                values={recordProducts}
            />

            <TextField
                friendlyName="Estoque Atual"
                name="current_stock"
                setValue={(value) => handleInputChange('current_stock', new Decimal(value || 0))}
                value={stock.current_stock.toString()}
            />

            <TextField
                friendlyName="Estoque Mínimo"
                name="min_stock"
                setValue={(value) => handleInputChange('min_stock', new Decimal(value || 0))}
                value={stock.min_stock.toString()}
            />

            <TextField
                friendlyName="Estoque Máximo"
                name="max_stock"
                setValue={(value) => handleInputChange('max_stock', new Decimal(value || 0))}
                value={stock.max_stock.toString()}
            />

            <TextField
                friendlyName="Unidade"
                name="unit"
                setValue={(value) => handleInputChange('unit', value)}
                value={stock.unit}
                placeholder="ex: unidades, kg, litros"
            />

            <CheckboxField
                friendlyName="Controle Ativo"
                name="is_active"
                setValue={(value) => handleInputChange('is_active', value)}
                value={stock.is_active}
            />

            <ErrorForms errors={errors} setErrors={setErrors} />

            <ButtonsModal
                item={stock}
                name="stock"
                onSubmit={submit}
            />
        </>
    )
}

export default StockForm 