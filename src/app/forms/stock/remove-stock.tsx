'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TextField } from '../../components/modal/field';
import ButtonsModal from '../../components/modal/buttons-modal';
import { useSession } from 'next-auth/react';
import { SchemaRemoveStockMovement, RemoveStockMovementFormData } from '@/app/entities/stock/stock-movement';
import Stock from '@/app/entities/stock/stock';
import { useModal } from '@/app/context/modal/context';
import RequestError from '@/app/utils/error';
import { notifySuccess, notifyError } from '@/app/utils/notifications';
import RemoveStock, { RemoveStockRequest } from '@/app/api/stock/movement/remove';
import Decimal from 'decimal.js';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface RemoveStockFormProps {
    stock?: Stock;
}

const RemoveStockForm = ({ stock }: RemoveStockFormProps) => {
    const modalName = 'remove-stock-' + stock?.id;
    const modalHandler = useModal();
    const { data: session } = useSession();
    const queryClient = useQueryClient();
    const [isSaving, setIsSaving] = useState(false);

    const {
        handleSubmit,
        setValue,
        watch,
        formState: { errors }
    } = useForm<RemoveStockMovementFormData>({
        resolver: zodResolver(SchemaRemoveStockMovement),
        defaultValues: {
            quantity: 0,
            reason: '',
        }
    });

    const formData = watch();

    const onInvalid = () => {
        console.log(errors);
        notifyError('Verifique os campos obrigatórios');
    };

    const createMutation = useMutation({
        mutationFn: (request: RemoveStockRequest) => RemoveStock(stock?.id!, request, session!),
        onSuccess: () => {
            notifySuccess(`Estoque removido com sucesso`);
            queryClient.invalidateQueries({ queryKey: ['stocks'] });
            modalHandler.hideModal(modalName);
        },
        onError: (error: RequestError) => {
            notifyError(error.message || 'Erro ao remover estoque');
        },
        onSettled: () => setIsSaving(false)
    });

    const submit = async (data: RemoveStockMovementFormData) => {
        if (!session || !stock?.id) return;
        setIsSaving(true);

        const request: RemoveStockRequest = {
            id: stock.id,
            quantity: new Decimal(data.quantity),
            reason: data.reason,
            price: new Decimal(0),
            new_stock: 0,
        } as RemoveStockRequest;

        createMutation.mutate(request);
    }

    return (
        <div className="space-y-4">
            <TextField
                friendlyName="Quantidade"
                name="quantity"
                setValue={(value: any) => setValue('quantity', value)}
                value={formData.quantity.toString()}
                error={errors.quantity?.message}
            />

            <TextField
                friendlyName="Motivo"
                name="reason"
                setValue={(value: any) => setValue('reason', value)}
                value={formData.reason}
                placeholder="ex: Venda, Perda, Ajuste"
                error={errors.reason?.message}
            />

            <ButtonsModal
                item={{ ...formData, id: stock?.id || '' }}
                name="stock-movement"
                onSubmit={handleSubmit(submit, onInvalid)}
                isPending={isSaving}
            />
        </div>
    )
}

export default RemoveStockForm;