'use client';

import React, { useEffect, useState } from 'react';
import { TextField } from '../../components/modal/field';
import StockMovement, { ValidateStockMovementForm } from '@/app/entities/stock/stock-movement';
import ButtonsModal from '../../components/modal/buttons-modal';
import { useSession } from 'next-auth/react';
import Stock from '@/app/entities/stock/stock';
import { useModal } from '@/app/context/modal/context';
import ErrorForms from '../../components/modal/error-forms';
import RequestError from '@/app/utils/error';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { SelectField } from '@/app/components/modal/field';
import { notifySuccess, notifyError } from '@/app/utils/notifications';
import AddStock from '@/app/api/stock/movement/add';
import Decimal from 'decimal.js';

interface AddStockFormProps {
    stock?: Stock;
}

const AddStockForm = ({ stock }: AddStockFormProps) => {
    const modalName = 'add-stock'
    const modalHandler = useModal();
    const categoriesSlice = useSelector((state: RootState) => state.categories);
    const stockSlice = useSelector((state: RootState) => state.stock);
    const [movement, setMovement] = useState<StockMovement>(new StockMovement());
    const [stocks, setStocks] = useState<Stock[]>([]);
    const [recordStocks, setRecordStocks] = useState<{ id: string; name: string; }[]>([]);
    const { data } = useSession();
    const [errors, setErrors] = useState<Record<string, string[]>>({});

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
        if (!data) return;
        
        // Configurar movimento como entrada
        movement.type = 'in';
        
        const validationErrors = ValidateStockMovementForm(movement);
        if (Object.values(validationErrors).length > 0) return setErrors(validationErrors);

        try {
            await AddStock(movement, data);
            notifySuccess(`Estoque adicionado com sucesso`);
            modalHandler.hideModal(modalName);

        } catch (error) {
            const err = error as RequestError;
            notifyError(err.message || 'Erro ao adicionar estoque');
        }
    }

    useEffect(() => {
        const LoadStocks = async () => {
            if (!data) return;

            try {
                // Buscar estoques do Redux store
                const allStocks = Object.values(stockSlice.entities);
                setStocks(allStocks);

                let records: { id: string; name: string; }[] = [];

                if (allStocks.length === 0) {
                    setRecordStocks([]);
                    return;
                }

                for (const stock of allStocks) {
                    records.push({ id: stock.product_id, name: stock.product?.name || 'Produto não encontrado' })
                }
                setRecordStocks(records);

            } catch (error: RequestError | any) {
                notifyError(error);
            }
        }

        LoadStocks();
    }, [data?.user.access_token, stockSlice.entities]);

    return (
        <>
            <SelectField
                friendlyName="Produto"
                name="product_id"
                selectedValue={movement.product_id}
                setSelectedValue={(value) => handleInputChange('product_id', value)}
                values={recordStocks}
            />

            <TextField
                friendlyName="Quantidade"
                name="quantity"
                setValue={(value) => handleInputChange('quantity', new Decimal(value || 0))}
                value={movement.quantity.toString()}
            />

            <TextField
                friendlyName="Motivo"
                name="reason"
                setValue={(value) => handleInputChange('reason', value)}
                value={movement.reason}
                placeholder="ex: Compra, Ajuste de inventário"
            />

            <TextField
                friendlyName="Custo Unitário"
                name="unit_cost"
                setValue={(value) => handleInputChange('unit_cost', new Decimal(value || 0))}
                value={movement.unit_cost.toString()}
            />

            <TextField
                friendlyName="Observações"
                name="notes"
                setValue={(value) => handleInputChange('notes', value)}
                value={movement.notes}
                optional
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