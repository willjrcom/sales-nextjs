import React from 'react';
import { IconType } from 'react-icons';
import { FaUserTie, FaCog, FaPlus } from 'react-icons/fa';
import { TiFlowMerge } from 'react-icons/ti';
import { MdFastfood, MdOutlineHomeWork } from "react-icons/md";
import { BsFillPeopleFill } from "react-icons/bs";
import Link from 'next/link';
import styles from './Sidebar.module.css';

interface TopbarItemProps {
  icon: IconType;
  label: string;
  path: string;
}

interface TopbarItemCompanyProps {
  icon: IconType;
  label: string;
  path: string;
}

const SidebarItem: React.FC<TopbarItemProps> = ({ icon: Icon, label, path }) => {
  return (
    <Link href={path}>
      <div className={styles.menuItem}>
        <Icon className={styles.icon} />
        <span className={styles.label}>{label}</span>
      </div>
    </Link>
  )
}

const SidebarItemCompany: React.FC<TopbarItemCompanyProps> = ({ icon: Icon, label, path }) => {
  return (
    <Link href={path} style={{height: '100px'}}>
      <div className={styles.menuItemCompanyBlock}>
      <div className={styles.menuItemCompany}>
        <Icon className={styles.icon} />
        <span className={styles.label}>{label}</span>
      </div>
      </div>
    </Link>
  )
}

const Sidebar = () => {
  return (
    <div className={styles.sidebar}>
      <div className={styles.sidebarContainer}>
        <SidebarItemCompany icon={MdOutlineHomeWork} label="Loja" path="/" />
        <SidebarItem icon={FaPlus} label="Novo Pedido" path="/" />
        <SidebarItem icon={TiFlowMerge} label="Processos" path="/" />
        <SidebarItem icon={MdFastfood} label="Cardápio" path="/" />
        <SidebarItem icon={BsFillPeopleFill} label="Clientes" path="/" />
        <SidebarItem icon={FaUserTie} label="Funcionários" path="/" />
        <SidebarItem icon={MdOutlineHomeWork} label="Minha Empresa" path="/" />
        <SidebarItem icon={FaCog} label="Configurações" path="/" />
      </div>
    </div>
  );
};

export default Sidebar;
