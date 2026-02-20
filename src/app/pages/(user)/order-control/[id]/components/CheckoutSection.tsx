
import { useState, useEffect } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import GetOrderByID from '@/app/api/order/[id]/order';
import PendingOrder from '@/app/api/order/status/pending/order';
import UpdateChangeOrderDelivery from '@/app/api/order-delivery/update/change/order-delivery';
import { payMethodsWithId } from '@/app/entities/order/order-payment';
import Decimal from 'decimal.js';
import { notifySuccess, notifyError } from '@/app/utils/notifications';
import { FaTruck, FaCreditCard, FaArrowLeft } from 'react-icons/fa';
import { useSession } from 'next-auth/react';
import { OrderControlView } from '../page';
import { useRouter } from 'next/navigation';

// Simple Input component if not available in shared
const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input {...props} className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${props.className}`} />
)

interface CheckoutSectionProps {
    orderID: string;
    setView: (view: OrderControlView) => void;
}

export function CheckoutSection({ orderID, setView }: CheckoutSectionProps) {
    const { data: session } = useSession();
    const router = useRouter(); // Use router to refresh or redirect if needed
    const queryClient = useQueryClient();
    const [paymentMethod, setPaymentMethod] = useState<string>('Dinheiro');
    const [changeFor, setChangeFor] = useState<string>('');


    const { data: order, isLoading } = useQuery({
        queryKey: ['order', 'current'],
        queryFn: () => GetOrderByID(orderID, session!),
        enabled: !!orderID && !!session,
    });

    // Initialize payment method and change from order
    useEffect(() => {
        if (order?.delivery) {
            setPaymentMethod(order.delivery.payment_method || 'Dinheiro');
            setChangeFor(order.delivery.change ? new Decimal(order.delivery.change).toFixed(2) : '');
        }
    }, [order]);

    const updatePaymentMutation = useMutation({
        mutationFn: async () => {
            if (!order?.delivery) throw new Error('Pedido sem entrega');
            if (!session) throw new Error('Sessão expirada');
            const changeAmount = paymentMethod === 'Dinheiro' && changeFor ? parseFloat(changeFor) : 0;
            return await UpdateChangeOrderDelivery(order.delivery.id, changeAmount, paymentMethod, session);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['order', 'current'] });
            notifySuccess('Pagamento atualizado!');
        },
        onError: (error: any) => {
            notifyError(error?.message || 'Erro ao atualizar pagamento');
        },
    });

    const submitOrderMutation = useMutation({
        mutationFn: async () => {
            if (!orderID) throw new Error('Pedido não encontrado');
            if (!session) throw new Error('Sessão expirada');
            return await PendingOrder(orderID, session);
        },
        onSuccess: () => {
            notifySuccess('Pedido enviado com sucesso! 🎉');
            queryClient.invalidateQueries({ queryKey: ['order', 'current'] });
            window.location.reload();
        },
        onError: (error: any) => {
            notifyError(error?.message || 'Erro ao enviar pedido');
        },
    });

    const handlePaymentChange = async (method: string) => {
        setPaymentMethod(method);
        // Auto update when changing method? Or wait? 
        // gfood Logic updates on blur or submit. Let's update state only here.
    };

    const handleChangeForBlur = () => {
        if (paymentMethod === 'Dinheiro' && changeFor) {
            updatePaymentMutation.mutate();
        }
    };

    const handleSubmitOrder = () => {
        // Ensure payment is saved before submitting
        if (order?.delivery && paymentMethod !== order.delivery.payment_method) {
            updatePaymentMutation.mutate();
        }
        submitOrderMutation.mutate();
    };

    if (isLoading || !order) {
        return (
            <div className='min-h-screen pt-10 text-center'>
                <p className='text-gray-500'>Carregando...</p>
            </div>
        );
    }

    const subtotal = new Decimal(order.total_payable || 0);
    const deliveryFee = new Decimal(order.delivery?.delivery_tax || 0);
    const total = subtotal.plus(deliveryFee);
    const client = order.delivery?.client;
    const address = client?.address;

    return (
        <div className='min-h-screen bg-gray-50 pb-24 pt-4'>
            <div className="px-4 mb-4">
                <Button variant="ghost" onClick={() => setView('cart')} className="-ml-3 text-gray-600 gap-2">
                    <FaArrowLeft /> Voltar ao carrinho
                </Button>
                <h1 className="text-2xl font-bold text-gray-900 mt-2">Finalizar Pedido</h1>
            </div>

            <div className='mx-auto max-w-md px-4 space-y-4'>

                {/* Order Summary */}
                <Card className='p-4 shadow-sm border border-gray-100'>
                    <h3 className='font-semibold text-lg mb-3'>Resumo do Pedido</h3>
                    <div className='space-y-2 text-sm'>
                        <div className='flex justify-between'>
                            <span className='text-gray-600'>Subtotal</span>
                            <span className='font-medium'>R$ {subtotal.toFixed(2)}</span>
                        </div>
                        {order.delivery && (
                            <div className='flex justify-between'>
                                <span className='text-gray-600'>Taxa de entrega</span>
                                <span className='font-medium'>R$ {deliveryFee.toFixed(2)}</span>
                            </div>
                        )}
                        <div className='border-t pt-2 flex justify-between text-base'>
                            <span className='font-semibold'>Total</span>
                            <span className='font-bold text-blue-600 text-xl'>R$ {total.toFixed(2)}</span>
                        </div>
                    </div>
                </Card>

                {/* Delivery Information */}
                {order.delivery && (
                    <Card className='p-4 shadow-sm border border-gray-100'>
                        <div className='flex items-center justify-between mb-3'>
                            <h3 className='font-semibold text-lg flex items-center gap-2'>
                                <FaTruck className='text-green-600' />
                                Informações de Entrega
                            </h3>
                            {/* Add edit button if needed */}
                        </div>
                        <div className='space-y-1 text-sm'>
                            <p className='font-medium'>{client?.name}</p>
                            <p className='text-gray-600'>{client?.contact?.number}</p>
                            {address && (
                                <>
                                    <p className='text-gray-600'>
                                        {address.street}, {address.number}
                                    </p>
                                    <p className='text-gray-600'>
                                        {address.neighborhood} - {address.city}
                                    </p>
                                    <p className='text-gray-600'>CEP: {address.cep}</p>
                                </>
                            )}
                        </div>
                    </Card>
                )}

                {/* Table Information */}
                {order.table && (
                    <Card className='p-4 shadow-sm border border-gray-100'>
                        <h3 className='font-semibold text-lg mb-3 flex items-center gap-2'>
                            🍽️ Informações da Mesa
                        </h3>
                        <div className='space-y-1 text-sm'>
                            <p className='text-gray-600'>Mesa: <span className='font-bold text-gray-900'>{order.table.table?.name || 'N/A'}</span></p>
                            <p className='text-gray-600'>Cliente: {order.table.name || 'N/A'}</p>
                        </div>
                    </Card>
                )}

                {/* Pickup Information */}
                {order.pickup && (
                    <Card className='p-4 shadow-sm border border-gray-100'>
                        <h3 className='font-semibold text-lg mb-3 flex items-center gap-2'>
                            🛍️ Retirada no Balcão
                        </h3>
                        <div className='space-y-1 text-sm'>
                            <p className='text-gray-600'>Cliente: <span className='font-bold text-gray-900'>{order.pickup.name}</span></p>
                        </div>
                    </Card>
                )}

                {/* Payment Method - Only for Delivery */}
                {order.delivery && (
                    <Card className='p-4 shadow-sm border border-gray-100'>
                        <h3 className='font-semibold text-lg mb-3 flex items-center gap-2'>
                            <FaCreditCard className='text-blue-600' />
                            Forma de Pagamento
                        </h3>

                        <div className='space-y-3'>
                            <div>
                                <label htmlFor='payment-method' className='text-sm text-gray-600 mb-1 block'>
                                    Selecione a forma de pagamento
                                </label>
                                <select
                                    id='payment-method'
                                    value={paymentMethod}
                                    onChange={(e) => {
                                        handlePaymentChange(e.target.value);
                                        // updatePaymentMutation.mutate(); // wait for blur/submit? or instant?
                                    }}
                                    onBlur={() => updatePaymentMutation.mutate()} // Trigger update on blur of select
                                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white'
                                >
                                    {payMethodsWithId.map((method) => (
                                        <option key={method.id} value={method.id}>
                                            {method.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {paymentMethod === 'Dinheiro' && (
                                <div>
                                    <label htmlFor='change-for' className='text-sm text-gray-600 mb-1 block'>
                                        Troco para (opcional)
                                    </label>
                                    <Input
                                        id='change-for'
                                        type='text'
                                        inputMode='decimal'
                                        value={changeFor}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(',', '.');
                                            if (/^\d*\.?\d{0,2}$/.test(value)) {
                                                setChangeFor(value);
                                            }
                                        }}
                                        onBlur={handleChangeForBlur}
                                        placeholder='R$ 0,00'
                                        className='text-base'
                                    />
                                    <p className='text-xs text-gray-500 mt-1'>
                                        Deixe em branco se não precisar de troco
                                    </p>
                                </div>
                            )}
                        </div>
                    </Card>
                )}

                {/* Submit Button */}
                <Button
                    size='lg'
                    className='w-full h-14 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold text-lg shadow-lg'
                    onClick={handleSubmitOrder}
                    disabled={submitOrderMutation.isPending}
                >
                    {submitOrderMutation.isPending ? 'Enviando...' : (order.table ? '👨‍🍳 Enviar para Cozinha' : '🚀 Enviar Pedido')}
                </Button>
            </div>
        </div>
    );
}
