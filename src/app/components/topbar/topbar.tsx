'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Toaster, toast } from 'react-hot-toast';
import { FaExclamationCircle } from 'react-icons/fa';
import EmployeeUserProfile from '../profile/profile';
import { useSession } from 'next-auth/react';
import GetUser from '@/app/api/user/me/user';
import User from '@/app/entities/user/user';
import Order from '@/app/entities/order/order';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { PendingPaymentModal } from '../billing/pending-payment-modal';
import { listPayments } from '@/app/api/billing/billing';
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar"

interface TopbarItemPaymentAlertProps {
  onClick: () => void;
}

const TopbarItemPaymentAlert = ({ onClick }: TopbarItemPaymentAlertProps) => (
  <div onClick={onClick} className="inline-flex items-center bg-destructive text-destructive-foreground px-3 py-1.5 rounded-sm text-sm font-medium transition-colors hover:bg-destructive/90 cursor-pointer">
    <FaExclamationCircle className="mr-2 text-base" />
    Pagamentos pendentes
  </div>
);

const Topbar = () => {
  const [user, setUser] = useState<User | null>(null);
  const { data } = useSession();
  const queryClient = useQueryClient();
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);

  // Ler o pedido atual do cache
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);

  const { data: paymentsResponse } = useQuery({
    queryKey: ['company-payments', 0],
    queryFn: () => listPayments(data!, 0, 100),
    enabled: !!data?.user?.access_token,
    staleTime: 60000,
  });

  const hasPendingPayments = React.useMemo(() => {
    if (!paymentsResponse?.items) return false;
    return paymentsResponse.items.some(p => p.is_mandatory && p.status === 'pending');
  }, [paymentsResponse]);

  useEffect(() => {
    const checkCache = () => {
      const cachedOrder = queryClient.getQueryData<Order>(['order', 'current']);
      setCurrentOrder(cachedOrder || null);
    };

    checkCache();
    const interval = setInterval(checkCache, 1000);
    return () => clearInterval(interval);
  }, [queryClient]);

  useEffect(() => {
    getUser();
  }, [data?.user?.access_token]);

  const getUser = async () => {
    if (!data) return;
    const user = await GetUser(data);
    setUser(user);
  }

  return (
    <>
      <header className="flex justify-between items-center border-b bg-background px-4 h-14 w-full shadow-sm">
        <div className="flex items-center gap-2">
          <SidebarTrigger />
          <Menubar className="border-none shadow-none bg-transparent">
            <MenubarMenu>
              <MenubarTrigger asChild className="cursor-pointer border border-border">
                <Link href="/pages/order-control">Pedidos</Link>
              </MenubarTrigger>
            </MenubarMenu>
            <MenubarMenu>
              <MenubarTrigger asChild className="cursor-pointer border border-border">
                <Link href="/pages/order-table-control">Mesas</Link>
              </MenubarTrigger>
            </MenubarMenu>
            <MenubarMenu>
              <MenubarTrigger asChild className="cursor-pointer border border-border">
                <Link href="/pages/order-delivery-control">Entregas</Link>
              </MenubarTrigger>
            </MenubarMenu>
            <MenubarMenu>
              <MenubarTrigger asChild className="cursor-pointer border border-border">
                <Link href="/pages/order-pickup-control">Retiradas</Link>
              </MenubarTrigger>
            </MenubarMenu>

            {currentOrder?.status === 'Staging' && (
              <MenubarMenu>
                <MenubarTrigger asChild className="bg-destructive text-destructive-foreground hover:bg-destructive/90 focus:bg-destructive/90 focus:text-destructive-foreground data-[state=open]:bg-destructive/90 data-[state=open]:text-destructive-foreground">
                  <Link href={"/pages/order-control/" + currentOrder.id} className="flex items-center">
                    <FaExclamationCircle className="mr-2" />
                    Pedido em aberto
                  </Link>
                </MenubarTrigger>
              </MenubarMenu>
            )}
          </Menubar>
        </div>

        <div className="flex space-x-4 items-center">
          {hasPendingPayments && <TopbarItemPaymentAlert onClick={() => setPaymentModalOpen(true)} />}

          <div className="inline-flex items-center bg-green-100 text-green-800 px-3 py-1.5 rounded-sm text-sm font-medium">
            <Link href="/pages/shift">Turno</Link>
          </div>

          {user && <EmployeeUserProfile user={user} setUser={setUser} />}
        </div>
      </header>
      <PendingPaymentModal isOpen={isPaymentModalOpen} onOpenChange={setPaymentModalOpen} />
      <Toaster
        position="top-right"
        containerStyle={{ zIndex: 20000 }}
      />
    </>
  )
};

export default Topbar;
