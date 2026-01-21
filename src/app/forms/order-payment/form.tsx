'use client';

import React, { useState } from 'react';
import { HiddenField, SelectField } from '../../components/modal/field';
import { notifySuccess, notifyError } from '@/app/utils/notifications';
import PriceField from '@/app/components/modal/fields/price';
import ButtonsModal from '../../components/modal/buttons-modal';
import { useSession } from 'next-auth/react';
import CreateFormsProps from '../create-forms-props';
import { useModal } from '@/app/context/modal/context';
import ErrorForms from '../../components/modal/error-forms';
import RequestError from '@/app/utils/error';
import { PaymentOrder, payMethodsWithId, ValidatePaymentForm } from '@/app/entities/order/order-payment';
import PayOrder from '@/app/api/order/payment/order';
import { useQueryClient } from '@tanstack/react-query';

interface PaymentFormProps extends CreateFormsProps<PaymentOrder> {
    orderId?: string;
}

const PaymentForm = ({ item, isUpdate, orderId }: PaymentFormProps) => {
    const modalName = isUpdate ? 'edit-payment-' + item?.id : 'add-payment'
    const modalHandler = useModal();
    const [payment, setPayment] = useState<PaymentOrder>(item || new PaymentOrder());
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const queryClient = useQueryClient();
    const { data } = useSession();

    const handleInputChange = (field: keyof PaymentOrder, value: any) => {
        setPayment(prev => ({ ...prev, [field]: value }));
    };

    const submit = async () => {
        if (!data || !orderId) return;

        payment.order_id = orderId

        const validationErrors = ValidatePaymentForm(payment);
        if (Object.values(validationErrors).length > 0) return setErrors(validationErrors);

        try {
            await PayOrder(payment, data)

            // Invalidar queries do pedido
            queryClient.invalidateQueries({ queryKey: ['order', 'current'] });
            notifySuccess('Pagamento realizado com sucesso');
            modalHandler.hideModal(modalName);
        } catch (error) {
            const err = error as RequestError;
            notifyError(err.message || 'Erro ao processar pagamento');
        }
    }

    return (
        <div className="text-black space-y-6">
            <div className="bg-gradient-to-br from-white to-green-50 rounded-lg shadow-sm border border-green-100 p-6 transition-all duration-300 hover:shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-green-200">Informações do Pagamento</h3>
                <div className="space-y-4">
                    <div className="transform transition-transform duration-200 hover:scale-[1.01]">
                        <PriceField friendlyName='Total Pago' name='total_paid' setValue={value => handleInputChange('total_paid', value)} value={payment.total_paid} />
                    </div>
                    <div className="transform transition-transform duration-200 hover:scale-[1.01]">
                        <SelectField friendlyName='Método de pagamento' values={payMethodsWithId} name='method' setSelectedValue={value => handleInputChange('method', value)} selectedValue={payment.method} />
                    </div>
                </div>
            </div>

            <HiddenField name='id' setValue={value => handleInputChange('id', value)} value={payment.id} />
            <HiddenField name='order_id' setValue={value => handleInputChange('order_id', value)} value={orderId} />

            <ErrorForms errors={errors} setErrors={setErrors} />
            <ButtonsModal item={payment} name="Tamanho" onSubmit={submit} isAddItem />
        </div>
    );
};

export default PaymentForm;
