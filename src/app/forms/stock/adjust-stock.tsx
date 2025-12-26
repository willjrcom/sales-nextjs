'use client';

import React, { useEffect, useState } from 'react';
import { TextField } from '../../components/modal/field';
import ButtonsModal from '../../components/modal/buttons-modal';
import { useSession } from 'next-auth/react';
import Stock from '@/app/entities/stock/stock';
import { useModal } from '@/app/context/modal/context';
import ErrorForms from '../../components/modal/error-forms';
import RequestError from '@/app/utils/error';
import { notifySuccess, notifyError } from '@/app/utils/notifications';
import AdjustStock, { AdjustStockRequest } from '@/app/api/stock/movement/adjust';
import Decimal from 'decimal.js';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface AdjustStockFormProps {
    stock?: Stock;
}

const AdjustStockForm = ({ stock }: AdjustStockFormProps) => {
    const modalName = 'adjust-stock-'+ stock?.id;
    const modalHandler = useModal();
    const [movement, setMovement] = useState<AdjustStockRequest>({} as AdjustStockRequest);
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

    const handleInputChange = (field: keyof AdjustStockRequest, value: any) => {
        setMovement(prev => ({ ...prev, [field]: value }));
    };

    const createMutation = useMutation({
        mutationFn: (movement: AdjustStockRequest) => AdjustStock(stock?.id!, movement, data!),
        onSuccess: () => {
            notifySuccess(`Estoque ajustado com sucesso`);
            queryClient.invalidateQueries({ queryKey: ['stocks'] });
            modalHandler.hideModal(modalName);
        },
        onError: (error: RequestError) => {
            notifyError(error.message || 'Erro ao ajustar estoque');
        }
    });

    const submit = async () => {
        if (!data || !stock?.id) return;
        createMutation.mutate(movement);
    }

    return (
        <>
            <TextField
                friendlyName="Novo estoque"
                name="new_stock"
                setValue={(value) => handleInputChange('new_stock', new Decimal(value || 0))}
                value={new Decimal(movement.new_stock || 0).toString()}
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

export default AdjustStockForm 