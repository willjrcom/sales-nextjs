'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TextField } from '../../components/modal/field';
import StockMovement, { SchemaAddStockMovement, AddStockMovementFormData } from '@/app/entities/stock/stock-movement';
import ButtonsModal from '../../components/modal/buttons-modal';
import { useSession } from 'next-auth/react';
import Stock from '@/app/entities/stock/stock';
import { useModal } from '@/app/context/modal/context';
import RequestError from '@/app/utils/error';
import { notifySuccess, notifyError } from '@/app/utils/notifications';
import AddStock, { AddStockRequest } from '@/app/api/stock/movement/add';
import Decimal from 'decimal.js';
import PriceField from '@/app/components/modal/fields/price';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface AddStockFormProps {
    stock?: Stock;
}

const AddStockForm = ({ stock }: AddStockFormProps) => {
    const modalName = 'add-stock-' + stock?.id;
    const modalHandler = useModal();
    const { data: session } = useSession();
    const queryClient = useQueryClient();
    const [isSaving, setIsSaving] = useState(false);

    const {
        handleSubmit,
        setValue,
        watch,
        formState: { errors }
    } = useForm<AddStockMovementFormData>({
        resolver: zodResolver(SchemaAddStockMovement),
        defaultValues: {
            quantity: 0,
            reason: '',
            price: 0,
            expires_at: '',
        }
    });

    const formData = watch();

    const onInvalid = () => {
        console.log(errors);
        notifyError('Verifique os campos obrigatórios');
    };

    const createMutation = useMutation({
        mutationFn: (request: AddStockRequest) => AddStock(stock?.id!, request, session!),
        onSuccess: () => {
            notifySuccess(`Estoque adicionado com sucesso`);
            queryClient.invalidateQueries({ queryKey: ['stocks'] });
            modalHandler.hideModal(modalName);
        },
        onError: (error: RequestError) => {
            notifyError(error.message || 'Erro ao adicionar estoque');
        },
        onSettled: () => setIsSaving(false)
    });

    const submit = async (data: AddStockMovementFormData) => {
        if (!session || !stock?.id) return;
        setIsSaving(true);

        const request: AddStockRequest = {
            id: stock.id,
            quantity: new Decimal(data.quantity),
            reason: data.reason,
            price: new Decimal(data.price),
            new_stock: 0,
            expires_at: data.expires_at || undefined,
        } as AddStockRequest;

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
                placeholder="ex: Compra, Ajuste de inventário"
                error={errors.reason?.message}
            />

            <PriceField
                friendlyName="Custo Unitário"
                name="price"
                setValue={(value: any) => setValue('price', value)}
                value={formData.price.toString()}
                error={errors.price?.message}
            />



            <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Data de Validade (opcional)</label>
                <input
                    type="date"
                    value={formData.expires_at || ''}
                    onChange={(e) => setValue('expires_at', e.target.value)}
                    className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <ButtonsModal
                item={{ ...formData, id: stock?.id || '' }}
                name="stock-movement"
                onSubmit={handleSubmit(submit, onInvalid)}
                isPending={isSaving}
            />
        </div>
    )
}

export default AddStockForm;