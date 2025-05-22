'use client';

import React, { useState } from 'react';
import { TextField, HiddenField, SelectField } from '../../components/modal/field';
import PriceField from '@/app/components/modal/fields/price';
import ButtonsModal from '../../components/modal/buttons-modal';
import { useSession } from 'next-auth/react';
import CreateFormsProps from '../create-forms-props';
import { useModal } from '@/app/context/modal/context';
import ErrorForms from '../../components/modal/error-forms';
import RequestError from '@/app/utils/error';
import { PaymentOrder, payMethodsWithId, ValidatePaymentForm } from '@/app/entities/order/order-payment';
import PayOrder from '@/app/api/order/payment/order';
import { useCurrentOrder } from '@/app/context/current-order/context';
import Order from '@/app/entities/order/order';

interface PaymentFormProps extends CreateFormsProps<PaymentOrder> {
    setOrderPaymentError: (error: RequestError | null) => void;
    setOrderError: (error: RequestError | null) => void;
}

const PaymentForm = ({ item, isUpdate, setOrderPaymentError, setOrderError }: PaymentFormProps) => {
    const modalName = isUpdate ? 'edit-payment-' + item?.id : 'add-payment'
    const modalHandler = useModal();
    const [payment, setPayment] = useState<PaymentOrder>(item || new PaymentOrder());
    const [error, setError] = useState<RequestError | null>(null);
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const contextCurrentOrder = useCurrentOrder();
    const [order, setOrder] = useState<Order | null>(contextCurrentOrder.order);
    const { data } = useSession();
    
    const handleInputChange = (field: keyof PaymentOrder, value: any) => {
        setPayment(prev => ({ ...prev, [field]: value }));
    };

    const submit = async () => {
        if (!data || !order) return;

        payment.order_id = order.id

        const validationErrors = ValidatePaymentForm(payment);
        if (Object.values(validationErrors).length > 0) return setErrors(validationErrors);

        try {
            await PayOrder(payment, data)
            setError(null);
            setOrderPaymentError(null);
            setOrderError(null);

            contextCurrentOrder.fetchData(order.id);

            modalHandler.hideModal(modalName);

        } catch (error) {
            setError(error as RequestError);
        }
    }

    return (
        <>
            <PriceField friendlyName='Total Pago' name='total_paid' setValue={value => handleInputChange('total_paid', value)} value={payment.total_paid}/>
            <SelectField friendlyName='Método de pagamento' values={payMethodsWithId} name='method' setSelectedValue={value => handleInputChange('method', value)} selectedValue={payment.method}/>
            <HiddenField name='id' setValue={value => handleInputChange('id', value)} value={payment.id}/>
            <HiddenField name='order_id' setValue={value => handleInputChange('order_id', value)} value={order?.id}/>

            {error && <p className="mb-4 text-red-500">{error.message}</p>}
            <ErrorForms errors={errors} />
            <ButtonsModal item={payment} name="Tamanho" onSubmit={submit} isAddItem />
        </>
    );
};

export default PaymentForm;
