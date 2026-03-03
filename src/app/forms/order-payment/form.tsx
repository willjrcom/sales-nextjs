'use client';

import React from 'react';
import { SelectField } from '../../components/modal/field';
import { notifySuccess, notifyError } from '../../utils/notifications';
import PriceField from '../../components/modal/fields/price';
import ButtonsModal from '../../components/modal/buttons-modal';
import { useSession } from 'next-auth/react';
import CreateFormsProps from '../create-forms-props';
import { useModal } from '../../context/modal/context';
import RequestError from '../../utils/error';
import { PaymentOrder, payMethodsWithId, SchemaPayment, PaymentFormData } from '../../entities/order/order-payment';
import PayOrder from '../../api/order/payment/order';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Decimal from 'decimal.js';

interface PaymentFormProps extends CreateFormsProps<PaymentOrder> {
    orderId?: string;
}

const PaymentForm = ({ item, isUpdate, orderId }: PaymentFormProps) => {
    const modalName = isUpdate ? 'edit-payment-' + item?.id : 'add-payment'
    const modalHandler = useModal();
    const queryClient = useQueryClient();
    const { data: session } = useSession();

    const {
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isSubmitting }
    } = useForm<PaymentFormData>({
        resolver: zodResolver(SchemaPayment),
        defaultValues: {
            total_paid: item?.total_paid ? new Decimal(item.total_paid).toNumber() : 0,
            method: item?.method || "Dinheiro",
            order_id: orderId || '',
        }
    });

    const payMutation = useMutation({
        mutationFn: (paymentToSave: PaymentOrder) => PayOrder(paymentToSave, session!),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['order', orderId] });
            notifySuccess('Pagamento realizado com sucesso');
            modalHandler.hideModal(modalName);
        },
        onError: (error: RequestError) => {
            notifyError(error.message || 'Erro ao processar pagamento');
        }
    });

    const onInvalid = () => {
        console.log(errors);
        notifyError('Verifique os campos obrigatórios');
    };

    const onSubmit = (formData: PaymentFormData) => {
        if (!session || !orderId) return;

        const paymentToSave = new PaymentOrder();
        if (item) {
            Object.assign(paymentToSave, item);
        }

        // update with new formData
        paymentToSave.total_paid = new Decimal(formData.total_paid || 0);
        paymentToSave.method = formData.method as any;
        paymentToSave.order_id = orderId;

        payMutation.mutate(paymentToSave);
    }

    return (
        <div className="text-black space-y-6">
            <div className="bg-gradient-to-br from-white to-green-50 rounded-lg shadow-sm border border-green-100 p-6 transition-all duration-300 hover:shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-green-200">Informações do Pagamento</h3>
                <div className="space-y-4">
                    <div className="transform transition-transform duration-200 hover:scale-[1.01]">
                        <PriceField
                            friendlyName='Total Pago'
                            name='total_paid'
                            setValue={(value: any) => setValue('total_paid', value)}
                            value={watch('total_paid')}
                            error={errors.total_paid?.message}
                        />
                    </div>
                    <div className="transform transition-transform duration-200 hover:scale-[1.01]">
                        <SelectField
                            friendlyName='Método de pagamento'
                            values={payMethodsWithId}
                            name='method'
                            setSelectedValue={(value: any) => setValue('method', value)}
                            selectedValue={watch('method')}
                        />
                        {errors.method && <p className="text-red-500 text-xs italic mt-1">{errors.method.message}</p>}
                    </div>
                </div>
            </div>

            <ButtonsModal
                item={item || new PaymentOrder()}
                name="Pagamento"
                onSubmit={handleSubmit(onSubmit, onInvalid)}
                isAddItem
                isPending={payMutation.isPending || isSubmitting}
            />
        </div>
    );
};

export default PaymentForm;
