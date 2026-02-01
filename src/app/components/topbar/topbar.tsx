'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Toaster } from 'react-hot-toast';
import { FaExclamationCircle } from 'react-icons/fa';
import EmployeeUserProfile from './profile';
import { useSession } from 'next-auth/react';
import GetUser from '@/app/api/user/me/user';
import User from '@/app/entities/user/user';
import Order from '@/app/entities/order/order';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { PendingPaymentModal } from './pending-payment-modal';
import { listPayments } from '@/app/api/billing/billing';
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"



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
            <div className="hidden lg:block">
              <MenubarMenu>
                <MenubarTrigger asChild className="cursor-pointer border border-border">
                  <Link href="/pages/order-control">Pedidos</Link>
                </MenubarTrigger>
              </MenubarMenu>
            </div>
            <div className="hidden lg:block">
              <MenubarMenu>
                <MenubarTrigger asChild className="cursor-pointer border border-border">
                  <Link href="/pages/order-table-control">Mesas</Link>
                </MenubarTrigger>
              </MenubarMenu>
            </div>
            <div className="hidden lg:block">
              <MenubarMenu>
                <MenubarTrigger asChild className="cursor-pointer border border-border">
                  <Link href="/pages/order-delivery-control">Entregas</Link>
                </MenubarTrigger>
              </MenubarMenu>
            </div>
            <div className="hidden lg:block">
              <MenubarMenu>
                <MenubarTrigger asChild className="cursor-pointer border border-border">
                  <Link href="/pages/order-pickup-control">Retiradas</Link>
                </MenubarTrigger>
              </MenubarMenu>
            </div>

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

            {/* Overflow dropdown for items that don't fit */}
            <DropdownMenu>
              <DropdownMenuTrigger className="lg:hidden inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground" aria-label="More options">
                <MoreHorizontal className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem asChild>
                  <Link href="/pages/order-control" className="w-full cursor-pointer">Pedidos</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/pages/order-table-control" className="w-full cursor-pointer">Mesas</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/pages/order-delivery-control" className="w-full cursor-pointer">Entregas</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/pages/order-pickup-control" className="w-full cursor-pointer">Retiradas</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/pages/shift" className="w-full cursor-pointer">Turno</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </Menubar>
        </div>

        <div className="flex space-x-4 items-center">
          <div className="flex space-x-4 items-center">
            <Menubar className="border-none shadow-none bg-transparent">
              {hasPendingPayments && (
                <MenubarMenu>
                  <MenubarTrigger onClick={() => setPaymentModalOpen(true)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 focus:bg-destructive/90 cursor-pointer">
                    <FaExclamationCircle className="mr-2" />
                    Pagamentos pendentes
                  </MenubarTrigger>
                </MenubarMenu>
              )}

              <div className="hidden lg:block">
                <MenubarMenu>
                  <MenubarTrigger asChild className="bg-green-100 text-green-800 hover:bg-green-200 focus:bg-green-200 cursor-pointer">
                    <Link href="/pages/shift">Turno</Link>
                  </MenubarTrigger>
                </MenubarMenu>
              </div>
            </Menubar>

            {user && <EmployeeUserProfile user={user} setUser={setUser} />}
          </div>
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
