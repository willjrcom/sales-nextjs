import React from 'react';
import Link from 'next/link';
import styles from './topbar.module.css';
import { IconType } from 'react-icons';
import { IoIosNotifications } from 'react-icons/io';

interface TopbarItemProps {
  label: string;
  href: string;
  color?: string;
}

interface TopbarItemIconProps {
  icon: IconType;
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

const Topbar = () => (
  <div className={`${styles.topbar} flex justify-between`}>
    <div className="flex space-x-4">
      <TopbarItem label="Mesas" href="/pages/order-table-control" />
      <TopbarItem label="Pedidos" href="/pages/order-control" />
      <TopbarItem label="Entregas" href="/pages/delivery-control" />
    </div>

    <div className="flex space-x-4">
      <TopbarItem label="Turno" href="/pages/shift" color='green'/>
      <div>&nbsp;</div>
      <TopbarItemIcon icon={IoIosNotifications} href="/" />
    </div>
  </div>
);

export default Topbar;
