import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './topbar.module.css';
import { IconType } from 'react-icons';
import { IoIosNotifications } from 'react-icons/io';
import { FaExclamation, FaExclamationCircle } from 'react-icons/fa';
import { useCurrentOrder } from '@/app/context/current-order/context';

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


const TopbarItem: React.FC<TopbarItemProps> = ({ label, href, color }: TopbarItemProps) => (
  <Link href={href} style={{ backgroundColor: color }} className='rounded'>
    <div className="btn px-4 py-1">{label}</div>
  </Link>
);

const TopbarItemIcon: React.FC<TopbarItemIconProps> = ({ icon: Icon, href }) => (
  <Link href={href} className={styles.icon}>
      <Icon/>
  </Link>
);

const TopbarItemAlert: React.FC<TopbarItemIconProps> = ({ label, icon: Icon, href }) => (
  <Link href={href} className={styles.alert}>
    <div className="inline-flex items-center text-red-500"><Icon/>&nbsp;{label}</div>
  </Link>
);

const Topbar = () => {
  const contextCurrentOrder = useCurrentOrder();
  const [showCurrentOrder, setCurrentOrder] = useState(false);

  useEffect(() => {
    if (contextCurrentOrder.order?.status === "Staging") {
      setCurrentOrder(true);
    } else {
      setCurrentOrder(false);
    }
  }, [contextCurrentOrder.order]);

  return (
    <div className={`${styles.topbar} flex justify-between pl-[65px] pr-4`} > {/* Ajustamos o padding left dinamicamente */}
      <div className="flex space-x-4">
        <TopbarItem label="Pedidos" href="/pages/order-control" />
        <TopbarItem label="Mesas" href="/pages/order-table-control" />
        <TopbarItem label="Entregas" href="/pages/delivery-control" />
        {showCurrentOrder && <TopbarItemAlert label="Pedido em aberto" icon={FaExclamationCircle} href={"/pages/order-control/" + contextCurrentOrder.order?.id} />}
      </div>

      <div className="flex space-x-4">
        <TopbarItem label="Turno" href="/pages/shift" color='green'/>
        <div>&nbsp;</div>
        <TopbarItemIcon icon={IoIosNotifications} href="/" />
      </div>
    </div>
  )
};

export default Topbar;
