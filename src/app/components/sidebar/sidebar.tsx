'use client';

import React from 'react';
import { IconType } from 'react-icons';
import { FaUserTie, FaCog, FaPlus, FaSignOutAlt } from 'react-icons/fa';
import { TiFlowMerge } from 'react-icons/ti';
import { MdFastfood, MdOutlineHomeWork } from "react-icons/md";
import { BsFillPeopleFill } from "react-icons/bs";
import Link from 'next/link';
import styles from './sidebar.module.css';
import { signOut } from 'next-auth/react';

interface SidebarLinkItemProps {
  icon: IconType;
  label: string;
  href: string;
}

interface SidebarItemProps {
  icon: IconType;
  label: string;
  onClick?: () => Promise<void>;
}

const SidebarLinkItem: React.FC<SidebarLinkItemProps> = ({ icon: Icon, label, href }) => {
  return (
    <Link href={href} className={styles.menuItem}>
      <Icon className={styles.icon} />
      <span className={styles.label}>{label}</span>
    </Link>
  )
}

const SidebarItemCompany: React.FC<SidebarItemProps> = ({ icon: Icon, label }) => {
  return (
    <div className={styles.menuItemCompany}>
      <Icon className={styles.icon} />
      <div className='grid'>
        <span className={styles.label}>{label}</span>
        <div className={styles.description}>
          <span>Rua Piedade 226, Jd. Leocadia</span>
          <span>(11) 96384-9111</span>
        </div>
      </div>
    </div>
  )
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon: Icon, label, onClick }) => {
  return (
    <button className={styles.menuItem} onClick={onClick}>
      <Icon className={styles.icon} />
      <span className={styles.label}>{label}</span>
    </button>
  )
}

const Sidebar = () => {
  const signOutToLogin = async () => {
    await signOut({ callbackUrl: '/login', redirect: true });
  }

  return (
    <div className={styles.sidebar}>
      <div className={styles.sidebarContainer}>
        <SidebarItemCompany icon={MdOutlineHomeWork} label="Loja" />
        <SidebarLinkItem icon={FaPlus} label="Novo Pedido" href="/pages/new-order" />
        <SidebarLinkItem icon={TiFlowMerge} label="Processos" href="/" />
        <SidebarLinkItem icon={MdFastfood} label="Cardápio" href="/pages/product" />
        <SidebarLinkItem icon={BsFillPeopleFill} label="Clientes" href="/pages/client" />
        <SidebarLinkItem icon={FaUserTie} label="Funcionários" href="/pages/employee" />
        <SidebarLinkItem icon={MdOutlineHomeWork} label="Minha Empresa" href="/" />
        <SidebarLinkItem icon={FaCog} label="Configurações" href="/" />
        <SidebarItem icon={FaSignOutAlt} label="Sair" onClick={() => signOutToLogin()}/>
      </div>
    </div>
  );
};

export default Sidebar;
