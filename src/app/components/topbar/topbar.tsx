import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { IconType } from 'react-icons';
import { IoIosNotifications } from 'react-icons/io';
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


const TopbarItem = ({ label, href, color }: TopbarItemProps) => (
  <Link href={href} style={{ backgroundColor: color }} className='rounded'>
    <div className="btn px-4 py-1">{label}</div>
  </Link>
);

const TopbarItemIcon = ({ icon: Icon, href }: TopbarItemIconProps) => (
  <Link href={href} className="text-2xl self-center">
      <Icon/>
  </Link>
);

const TopbarItemAlert = ({ label, icon: Icon, href }: TopbarItemIconProps) => (
  <Link href={href} className="self-center">
    <div className="inline-flex items-center rounded px-4 py-1 bg-red-500"><Icon/>&nbsp;{label}</div>
  </Link>
);

const Topbar = () => {
  const contextCurrentOrder = useCurrentOrder();
  const [showCurrentOrder, setCurrentOrder] = useState(false);
  const { data } = useSession();

  useEffect(() => {
    if (contextCurrentOrder.order?.status === "Staging") {
      setCurrentOrder(true);
    } else {
      setCurrentOrder(false);
    }
  }, [contextCurrentOrder.order?.status]);

  return (
    <div className="flex justify-between pl-[65px] pr-4 w-full items-center h-[8vh] box-border bg-gray-800 text-white pl-2">
      <div className="flex space-x-4">
        <TopbarItem label="Pedidos" href="/pages/order-control" />
        <TopbarItem label="Mesas" href="/pages/order-table-control" />
        <TopbarItem label="Entregas" href="/pages/order-delivery-control" />
        {showCurrentOrder && <TopbarItemAlert label="Pedido em aberto" icon={FaExclamationCircle} href={"/pages/order-control/" + contextCurrentOrder.order?.id} />}
      </div>

      <div className="flex space-x-4">
        <TopbarItem label="Turno" href="/pages/shift" color='green'/>
        <div>&nbsp;</div>
        <TopbarItemIcon icon={IoIosNotifications} href="/" />
        {data?.user.user && <EmployeeUserProfile user={data?.user.user} />}
      </div>
    </div>
  )
};

export default Topbar;
