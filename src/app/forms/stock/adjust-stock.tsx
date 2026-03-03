'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TextField } from '../../components/modal/field';
import ButtonsModal from '../../components/modal/buttons-modal';
import { useSession } from 'next-auth/react';
import { SchemaAdjustStockMovement, AdjustStockMovementFormData } from '@/app/entities/stock/stock-movement';
import Stock from '@/app/entities/stock/stock';
import { useModal } from '@/app/context/modal/context';
import RequestError from '@/app/utils/error';
import { notifySuccess, notifyError } from '@/app/utils/notifications';
import AdjustStock, { AdjustStockRequest } from '@/app/api/stock/movement/adjust';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface AdjustStockFormProps {
    stock?: Stock;
}

const AdjustStockForm = ({ stock }: AdjustStockFormProps) => {
    const modalName = 'adjust-stock-' + stock?.id;
    const modalHandler = useModal();
    const { data: session } = useSession();
    const queryClient = useQueryClient();
    const [isSaving, setIsSaving] = useState(false);

    const {
        handleSubmit,
        setValue,
        watch,
        formState: { errors }
    } = useForm<AdjustStockMovementFormData>({
        resolver: zodResolver(SchemaAdjustStockMovement),
        defaultValues: {
            new_stock: Number(stock?.current_stock) || 0,
            reason: '',
        }
    });

    const formData = watch();

    const onInvalid = () => {
        console.log(errors);
        notifyError('Verifique os campos obrigatórios');
    };

    const createMutation = useMutation({
        mutationFn: (request: AdjustStockRequest) => AdjustStock(stock?.id!, request, session!),
        onSuccess: () => {
            notifySuccess(`Estoque ajustado com sucesso`);
            queryClient.invalidateQueries({ queryKey: ['stocks'] });
            modalHandler.hideModal(modalName);
        },
        onError: (error: RequestError) => {
            notifyError(error.message || 'Erro ao ajustar estoque');
        },
        onSettled: () => setIsSaving(false)
    });

    const submit = async (data: AdjustStockMovementFormData) => {
        if (!session || !stock?.id) return;
        setIsSaving(true);

        const request: AdjustStockRequest = {
            id: stock.id,
            new_stock: data.new_stock,
            reason: data.reason,
        } as AdjustStockRequest;

        createMutation.mutate(request);
    }

    return (
        <div className="space-y-4">
            <TextField
                friendlyName="Novo estoque"
                name="new_stock"
                setValue={(value: any) => setValue('new_stock', value)}
                value={formData.new_stock.toString()}
                error={errors.new_stock?.message}
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

export default AdjustStockForm;