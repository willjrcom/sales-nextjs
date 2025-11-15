'use client';

import React, { useEffect, useState } from 'react';
import { TextField } from '../../components/modal/field';
import StockMovement from '@/app/entities/stock/stock-movement';
import ButtonsModal from '../../components/modal/buttons-modal';
import { useSession } from 'next-auth/react';
import Stock from '@/app/entities/stock/stock';
import { useModal } from '@/app/context/modal/context';
import ErrorForms from '../../components/modal/error-forms';
import RequestError from '@/app/utils/error';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/redux/store';
import { notifySuccess, notifyError } from '@/app/utils/notifications';
import AddStock, { AddStockRequest } from '@/app/api/stock/movement/add';
import Decimal from 'decimal.js';
import PriceField from '@/app/components/modal/fields/price';
import { fetchReportStocks } from '@/redux/slices/stock';

interface AddStockFormProps {
    stock?: Stock;
}

const AddStockForm = ({ stock }: AddStockFormProps) => {
    const modalName = 'add-stock-' + stock?.id;
    const modalHandler = useModal();
    const [movement, setMovement] = useState<AddStockRequest>({} as AddStockRequest);
    const { data } = useSession();
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        if (stock) {
            setMovement(prev => ({
                ...prev,
                stock_id: stock.id,
                product_id: stock.product_id
            }));
        }
    }, [stock]);

    const handleInputChange = (field: keyof StockMovement, value: any) => {
        setMovement(prev => ({ ...prev, [field]: value }));
    };

    const submit = async () => {
        if (!data || !stock?.id) return;

        try {
            await AddStock(stock?.id, movement, data);
            notifySuccess(`Estoque adicionado com sucesso`);
            dispatch(fetchReportStocks({ session: data }));
            modalHandler.hideModal(modalName);

        } catch (error) {
            const err = error as RequestError;
            notifyError(err.message || 'Erro ao adicionar estoque');
        }
    }

    return (
        <>
            <TextField
                friendlyName="Quantidade"
                name="quantity"
                setValue={(value) => handleInputChange('quantity', new Decimal(value || 0))}
                value={new Decimal(movement.quantity || 0).toString()}
            />

            <TextField
                friendlyName="Motivo"
                name="reason"
                setValue={(value) => handleInputChange('reason', value)}
                value={movement.reason || ""}
                placeholder="ex: Compra, Ajuste de inventário"
            />

            <PriceField
                friendlyName="Custo Unitário"
                name="price"
                setValue={(value) => handleInputChange('price', new Decimal(value || 0))}
                value={new Decimal(movement.price || 0).toString()}
            />

            <PriceField
                friendlyName="Custo Total"
                name="total_price"
                setValue={(value) => handleInputChange('total_price', new Decimal(value || 0))}
                value={new Decimal(movement.total_price || 0).toString()}
            />

            <ErrorForms errors={errors} setErrors={setErrors} />

            <ButtonsModal
                item={movement}
                name="stock-movement"
                onSubmit={submit}
            />
        </>
    )
}

export default AddStockForm 