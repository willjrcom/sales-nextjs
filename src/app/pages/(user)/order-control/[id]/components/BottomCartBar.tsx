import { FaArrowRight } from 'react-icons/fa';
import { useQuery } from '@tanstack/react-query';
import GetOrderByID from '@/app/api/order/[id]/order';
import { useMemo } from 'react';
import Decimal from 'decimal.js';
import { OrderControlView } from '../page';
import { useSession } from 'next-auth/react';
import Order from '@/app/entities/order/order';

interface BottomCartBarProps {
    orderID: string;
    setView: (view: OrderControlView) => void;
}

export function BottomCartBar({ orderID, setView }: BottomCartBarProps) {
    const { data: session } = useSession();

    const { data: order } = useQuery({
        queryKey: ['order', 'current'], // Consistent with page query
        queryFn: () => GetOrderByID(orderID, session!),
        enabled: !!orderID && !!session,
    });

    // Also try getting from cache directly if query above is same key
    // const order = queryClient.getQueryData<Order>(['order', 'current']); // Or use the ID based key

    const count = order?.quantity_items || 0;

    const totalCents = useMemo(() => {
        if (!order?.total_payable) return 0;
        return new Decimal(order.total_payable).toNumber();
    }, [order?.total_payable]);

    if (count === 0) return null;

    return (
        <div className='fixed bottom-4 left-0 right-0 z-40 px-4'>
            <button
                onClick={() => setView('cart')}
                className='mx-auto w-full max-w-md rounded-3xl bg-black text-white shadow-lg p-3 flex items-center gap-3 cursor-pointer hover:bg-gray-900 transition-colors'
            >
                <div className='w-11 h-11 rounded-2xl bg-blue-500 text-white grid place-items-center font-bold'>
                    {count}
                </div>
                <div className='flex-1 text-left'>
                    <p className='text-xs text-white/70'>Total</p>
                    <p className='font-semibold'>R$ {new Decimal(totalCents || 0).toFixed(2)}</p>
                </div>
                <div className='inline-flex items-center gap-2 bg-white text-black rounded-2xl h-11 px-4 font-medium'>
                    Ver carrinho <FaArrowRight size={14} />
                </div>
            </button>
        </div>
    );
}
