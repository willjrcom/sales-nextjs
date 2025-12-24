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
import { notifySuccess, notifyError } from '@/app/utils/notifications';
import RemoveStock from '@/app/api/stock/movement/remove';
import Decimal from 'decimal.js';
import { RemoveStockRequest } from '@/app/api/stock/movement/remove';
import { useQueryClient } from '@tanstack/react-query';

interface RemoveStockFormProps {
    stock?: Stock;
}

const RemoveStockForm = ({ stock }: RemoveStockFormProps) => {
    const modalName = 'remove-stock-'+stock?.id;
    const modalHandler = useModal();
    const [movement, setMovement] = useState<RemoveStockRequest>({} as RemoveStockRequest);
    const { data } = useSession();
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const queryClient = useQueryClient();

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
            await RemoveStock(stock.id, movement, data);
            notifySuccess(`Estoque removido com sucesso`);
            queryClient.invalidateQueries({ queryKey: ['stocks'] });
            modalHandler.hideModal(modalName);

        } catch (error) {
            const err = error as RequestError;
            notifyError(err.message || 'Erro ao remover estoque');
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
                placeholder="ex: Venda, Perda, Ajuste"
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

export default RemoveStockForm 