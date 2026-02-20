
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import GetOrderByID from '@/app/api/order/[id]/order';
import { useMemo, useState } from 'react';
import { GetCategoriesMap } from '@/app/api/category/category';
import GroupItem from '@/app/entities/order/group-item';
import Decimal from 'decimal.js';
import { FaPlus, FaTrash } from 'react-icons/fa';
import DeleteItem from '@/app/api/item/delete/item';
import { notifySuccess, notifyError } from '@/app/utils/notifications';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { OrderControlView } from '../page';
import { useSession } from 'next-auth/react';
import GetGroupItemByID from '@/app/api/group-item/[id]/group-item';
import { GroupItemDetails } from './GroupItemDetails';
import { getStatusColor, showStatus } from '@/app/utils/status';

interface CartSectionProps {
    orderID: string;
    setView: (view: OrderControlView) => void;
}

function groupBy(array: GroupItem[], key: keyof GroupItem): Record<string, GroupItem[]> {
    if (!array || array.length === 0) return {};

    return array
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .reduce((result, currentItem) => {
            const groupKey = currentItem[key] as string;
            if (!result[groupKey]) {
                result[groupKey] = [];
            }
            result[groupKey].push(currentItem);
            return result;
        }, {} as Record<string, GroupItem[]>);
}

export function CartSection({ orderID, setView }: CartSectionProps) {
    const { data: session } = useSession();
    const queryClient = useQueryClient();
    const [itemToDelete, setItemToDelete] = useState<{ id: string, name: string } | null>(null);

    // Using the same query keys as MenuSection and BottomBar ensuring cache hits
    const { data: order } = useQuery({
        queryKey: ['order', 'current'],
        queryFn: () => {
            if (!session) return null;
            return GetOrderByID(orderID, session);
        },
        enabled: !!orderID && !!session
    });

    const { data: categoriesResponse } = useQuery({
        queryKey: ['categories', 'map', 'product'],
        queryFn: () => {
            if (!session) return [];
            return GetCategoriesMap(session, true)
        },
        enabled: !!session
    });

    const categoriesMap = useMemo(
        () => categoriesResponse?.sort((a, b) => a.name.localeCompare(b.name)) || [],
        [categoriesResponse]
    );

    const groupedItems = useMemo(
        () => groupBy((order?.group_items || []).filter(g => g.status !== 'Cancelled'), "category_id"),
        [order?.group_items]
    );

    const subtotal = useMemo(() => {
        if (!order) return new Decimal(0);
        // return new Decimal(order.total_payable || 0); // sales-nextjs logic might rely on manual calculation if backend field isn't updated instantly?
        // Let's stick to order.total_payable if available, assuming websocket/refetch updates it.
        // Actually in gfood-app we use order.total_payable.
        return new Decimal(order.total_payable || 0);
    }, [order]);

    const deliveryFee = new Decimal(order?.delivery?.delivery_tax || 0);
    const total = subtotal.plus(deliveryFee);

    const deleteItemMutation = useMutation({
        mutationFn: async (itemId: string) => {
            if (!session) return;
            return await DeleteItem(itemId, session);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['order', 'current'] });
            notifySuccess('Item removido com sucesso!');
        },
        onError: (error: any) => {
            notifyError(error?.message || 'Erro ao remover item');
        },
    });

    const handleDeleteItem = (itemId: string, itemName: string) => {
        setItemToDelete({ id: itemId, name: itemName });
    };

    const handleAddToGroup = async (groupItem: GroupItem) => {
        // We need to fetch the full group item to set as 'current'
        // because group inside order might be partial? Or just to be safe.
        try {
            if (!session) return;
            const fullGroupItem = await GetGroupItemByID(groupItem.id, session);
            queryClient.setQueryData(['group-item', 'current'], fullGroupItem);
            setView('menu');
        } catch (e) {
            notifyError("Erro ao carregar grupo");
        }
    };

    const handleAddNewGroup = () => {
        // Clear current group item (new group mode)
        queryClient.setQueryData(['group-item', 'current'], null);
        setView('menu');
    };

    const hasItems = Object.keys(groupedItems).length > 0;

    const GoToMenu = () => {
        setView('menu');
        queryClient.setQueryData(['group-item', 'current'], null);
    }

    return (
        <div className='min-h-screen bg-gray-50 pb-24 pt-4'>

            {/* Header-like navigation */}
            <div className="px-4 mb-4">
                <Button variant="ghost" onClick={() => GoToMenu()} className="-ml-3 text-gray-600 gap-2">
                    ← Voltar ao menu
                </Button>
                <h1 className="text-2xl font-bold text-gray-900 mt-2">Carrinho</h1>
            </div>

            <div className='mx-auto max-w-md px-4 space-y-4'>
                {/* Order Number Header */}
                <div className="flex justify-between items-center mb-4 px-2">
                    <h2 className="text-xl font-bold text-gray-800">Pedido #{order?.order_number}</h2>
                </div>

                {!hasItems ? (
                    <Card className='p-8 text-center flex flex-col items-center justify-center min-h-[300px]'>
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-3xl">🛒</div>
                        <p className='font-semibold text-lg'>Seu carrinho está vazio</p>
                        <p className='mt-2 text-sm text-gray-500'>Escolha itens no menu para continuar.</p>
                        <Button className='mt-6 w-full' onClick={() => setView('menu')}>
                            Voltar ao menu
                        </Button>
                    </Card>
                ) : (
                    <>
                        {/* Group Items */}
                        <div className='space-y-4'>
                            {order?.group_items
                                ?.filter(g => g.status !== 'Cancelled')
                                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                                .map((groupItem) => {
                                    const category = categoriesMap.find(cat => cat.id === groupItem.category_id);
                                    if (!groupItem.items || groupItem.items.length === 0) return null;

                                    // Show + button only if total quantity < 1 (incomplete meio a meio)
                                    const canAddMore = groupItem.quantity < 1 && groupItem.status === 'Staging';

                                    return (
                                        <Card key={groupItem.id} className='p-4 border shadow-sm'>
                                            {/* Group Header */}
                                            <div className='flex items-center justify-between mb-3 border-b border-gray-100 pb-2'>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h3 className='font-semibold text-base'>{category?.name || 'Categoria'}</h3>
                                                        <span className={`ml-2 px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor[groupItem.status]}`}>{showStatus[groupItem.status]}</span>
                                                    </div>
                                                    {groupItem.size && (
                                                        <p className='text-xs text-gray-500'>Tamanho: {groupItem.size}</p>
                                                    )}
                                                    {canAddMore && groupItem.quantity > 0 && (
                                                        <p className='text-xs text-orange-600 font-medium mt-0.5'>
                                                            Fracionado ({groupItem.quantity}/1)
                                                        </p>
                                                    )}
                                                </div>
                                                {canAddMore && (
                                                    <button
                                                        onClick={() => handleAddToGroup(groupItem)}
                                                        className='flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded bg-blue-50'
                                                        title='Adicionar mais itens a este grupo'
                                                    >
                                                        <FaPlus size={12} />
                                                        Adicionar
                                                    </button>
                                                )}
                                            </div>

                                            {/* Group Items */}
                                            <div className='space-y-3'>
                                                {groupItem.items.map(item => (
                                                    <div key={item.id} className='flex gap-3 items-start p-2 bg-gray-50 rounded-lg'>
                                                        <div className='min-w-0 flex-1'>
                                                            <div className="flex justify-between items-start">
                                                                <p className='font-medium text-sm leading-tight'>{item.name}</p>
                                                                <p className='text-sm font-semibold text-gray-900 ml-2'>
                                                                    R$ {new Decimal(item.total_price || 0).toFixed(2)}
                                                                </p>
                                                            </div>

                                                            {item.flavor && (
                                                                <p className='text-xs text-gray-500'>Sabor: {item.flavor}</p>
                                                            )}
                                                            {item.observation && (
                                                                <p className='text-xs text-gray-500 line-clamp-1'>Obs: {item.observation}</p>
                                                            )}
                                                            {item.additional_items && item.additional_items.length > 0 && (
                                                                <div className="mt-1">
                                                                    {item.additional_items.map(additional => (
                                                                        <p key={additional.id} className="text-xs text-gray-500">
                                                                            + {additional.quantity}x {additional.name} (R$ {new Decimal(additional.price).times(additional.quantity).toFixed(2)})
                                                                        </p>
                                                                    ))}
                                                                </div>
                                                            )}
                                                            {item.removed_items && item.removed_items.length > 0 && (
                                                                <div className="mt-1">
                                                                    {item.removed_items.map((removed, idx) => (
                                                                        <p key={idx} className="text-xs text-red-500 line-through">
                                                                            - Sem {removed}
                                                                        </p>
                                                                    ))}
                                                                </div>
                                                            )}
                                                            <div className="flex justify-end items-center mt-2 gap-2">
                                                                <p className='text-xs text-gray-600 bg-white px-2 py-0.5 rounded border'>x{item.quantity}</p>

                                                                {groupItem.status === "Staging" &&
                                                                    <button
                                                                        onClick={() => handleDeleteItem(item.id, item.name || 'Item')}
                                                                        className='p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors'
                                                                        title='Remover item'
                                                                        disabled={deleteItemMutation.isPending}
                                                                    >
                                                                        <FaTrash size={14} />
                                                                    </button>
                                                                }
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Group Details (Complement, Obs, Schedule) */}
                                            <GroupItemDetails groupItem={groupItem} isStaging={groupItem.status === 'Staging'} />

                                            {/* Group Total */}
                                            <div className='mt-3 pt-2 text-right border-t border-gray-100'>
                                                <span className='text-xs text-gray-500 mr-2'>Subtotal do grupo</span>
                                                <span className='font-semibold text-gray-900'>{new Decimal(groupItem.total_price || 0).toFixed(2)}</span>
                                            </div>
                                        </Card>
                                    );
                                })}
                        </div>

                        {/* Order Summary */}
                        <Card className='mt-6 p-4 shadow-md bg-white border-t-4 border-t-blue-500'>
                            <Row label='Subtotal' value={`R$ ${new Decimal(subtotal.toNumber()).toFixed(2)}`} />
                            {deliveryFee.greaterThan(0) && (
                                <Row label='Taxa de entrega' value={`R$ ${new Decimal(deliveryFee.toNumber()).toFixed(2)}`} />
                            )}
                            <div className='my-3 h-px bg-gray-100' />
                            <div className='flex items-center justify-between'>
                                <p className='text-base font-medium text-gray-600'>Total</p>
                                <p className='text-2xl font-extrabold text-blue-600'>R$ {new Decimal(total.toNumber()).toFixed(2)}</p>
                            </div>

                            {
                                <>
                                    {order?.group_items?.some(g => g.status === 'Staging') && (
                                        <Button className='mt-6 w-full h-12 text-lg bg-green-500 hover:bg-green-600' onClick={() => setView('checkout')}>
                                            Enviar pedido
                                        </Button>
                                    )}
                                    <Button
                                        className='mt-3 w-full'
                                        variant='outline'
                                        onClick={handleAddNewGroup}
                                    >
                                        Adicionar mais itens
                                    </Button>
                                </>}
                        </Card>
                    </>
                )}
            </div>

            <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remover item</AlertDialogTitle>
                        <AlertDialogDescription>
                            Deseja realmente remover "{itemToDelete?.name}" do carrinho?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                if (itemToDelete) {
                                    deleteItemMutation.mutate(itemToDelete.id);
                                    setItemToDelete(null);
                                }
                            }}
                            className="bg-red-500 hover:bg-red-600 focus:ring-red-500"
                        >
                            Remover
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

function Row({ label, value }: { label: string; value: string }) {
    return (
        <div className='flex items-center justify-between py-1'>
            <p className='text-sm text-gray-500'>{label}</p>
            <p className='text-sm font-medium'>{value}</p>
        </div>
    );
}
