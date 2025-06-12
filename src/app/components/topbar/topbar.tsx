 'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { IconType } from 'react-icons';
import { IoIosNotifications } from 'react-icons/io';
import { Toaster, toast } from 'react-hot-toast';
import { FaExclamationCircle } from 'react-icons/fa';
import { useCurrentOrder } from '@/app/context/current-order/context';
import EmployeeUserProfile from '../profile/profile';
import { useSession } from 'next-auth/react';

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
  const contextCurrentOrder = useCurrentOrder();
  const [showCurrentOrder, setCurrentOrder] = useState(false);
  const { data } = useSession();

  // Notificação: abre o toast com central de notificações
  const handleNotifications = () => {
    toast('Central de notificações', { icon: '🔔' });
  };

  useEffect(() => {
    if (contextCurrentOrder.order?.status === "Staging") {
      setCurrentOrder(true);
    } else {
      setCurrentOrder(false);
    }
  }, [contextCurrentOrder.order?.status]);

  return (
    <>
      <header className="flex justify-between items-center bg-gray-800 text-white h-16 w-full px-4 shadow-sm">
      <div className="flex space-x-4">
        <TopbarItem label="Pedidos" href="/pages/order-control" />
        <TopbarItem label="Mesas" href="/pages/order-table-control" />
        <TopbarItem label="Entregas" href="/pages/order-delivery-control" />
        {showCurrentOrder && <TopbarItemAlert label="Pedido em aberto" icon={FaExclamationCircle} href={"/pages/order-control/" + contextCurrentOrder.order?.id} />}
      </div>

        <div className="flex space-x-4">
          <TopbarItem label="Turno" href="/pages/shift" color='green'/>
          <button
            onClick={handleNotifications}
            className="p-2 rounded hover:bg-gray-700 transition-colors duration-200"
          >
            <IoIosNotifications className="text-xl text-gray-300" />
          </button>
          {data?.user.user && <EmployeeUserProfile user={data?.user.user} />}
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
