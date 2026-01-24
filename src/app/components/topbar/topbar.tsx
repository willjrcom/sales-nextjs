'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { IconType } from 'react-icons';
import { IoIosNotifications } from 'react-icons/io';
import { Toaster, toast } from 'react-hot-toast';
import { FaExclamationCircle } from 'react-icons/fa';
import EmployeeUserProfile from '../profile/profile';
import { useSession } from 'next-auth/react';
import GetUser from '@/app/api/user/me/user';
import User from '@/app/entities/user/user';
import Order from '@/app/entities/order/order';
import { useQueryClient } from '@tanstack/react-query';

interface TopbarItemProps {
  label: string;
  href: string;
  color?: string;
}

interface TopbarItemIconProps {
  icon: IconType;
  label?: string;
  href: string;
}


const TopbarItem = ({ label, href, color }: TopbarItemProps) => {
  const bgClasses = color === 'green' ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-700 hover:bg-gray-600';
  return (
    <Link
      href={href}
      className={`flex items-center justify-center px-3 py-2 ${bgClasses} text-white text-sm rounded-md transition-colors duration-200`}
    >
      {label}
    </Link>
  );
};

const TopbarItemAlert = ({ label, icon: Icon, href }: TopbarItemIconProps) => (
  <Link href={href} className="inline-flex items-center bg-red-500 text-white px-3 py-1 rounded-md text-sm transition-colors duration-200 hover:bg-red-600">
    <Icon className="mr-2 text-base" />
    {label}
  </Link>
);

const Topbar = () => {
  const [user, setUser] = useState<User | null>(null);
  const { data } = useSession();
  const queryClient = useQueryClient();

  // Ler o pedido atual do cache (sem localStorage!)
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);

  useEffect(() => {
    // Verificar cache periodicamente
    const checkCache = () => {
      const cachedOrder = queryClient.getQueryData<Order>(['order', 'current']);
      setCurrentOrder(cachedOrder || null);
    };

    checkCache();

    // Verificar a cada segundo se o cache mudou
    const interval = setInterval(checkCache, 1000);
    return () => clearInterval(interval);
  }, [queryClient]);

  // Notificação: abre o toast com central de notificações
  const handleNotifications = () => {
    toast('Central de notificações', { icon: '🔔' });
  };

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
      <header className="flex justify-between items-center bg-gray-800 text-white h-16 w-full px-4 shadow-sm relative">
        <div className="flex space-x-4">
          <TopbarItem label="Pedidos" href="/pages/order-control" />
          <TopbarItem label="Mesas" href="/pages/order-table-control" />
          <TopbarItem label="Entregas" href="/pages/order-delivery-control" />
          <TopbarItem label="Retiradas" href="/pages/order-pickup-control" />
          {currentOrder?.status === 'Staging' && (
            <TopbarItemAlert
              label="Pedido em aberto"
              icon={FaExclamationCircle}
              href={"/pages/order-control/" + currentOrder.id}
            />
          )}
        </div>

        <div className="flex space-x-4 items-center">
          <TopbarItem label="Turno" href="/pages/shift" color='green' />
          {/* <button
            onClick={handleNotifications}
            className="p-2 rounded hover:bg-gray-700 transition-colors duration-200"
          >
            <IoIosNotifications className="text-xl text-gray-300" />
          </button> */}
          {user && <EmployeeUserProfile user={user} setUser={setUser} />}
        </div>
      </header>
      <Toaster
        position="top-right"
        containerStyle={{ zIndex: 20000 }}
      />
    </>
  )
};

export default Topbar;
