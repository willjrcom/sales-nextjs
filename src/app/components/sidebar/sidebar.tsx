import React, { useEffect, useState } from 'react';
import { IconType } from 'react-icons';
import { FaUserTie, FaCog, FaPlus, FaSignOutAlt, FaRedo, FaUserLock, FaTh } from 'react-icons/fa';
import { TiFlowMerge } from 'react-icons/ti';
import { MdFastfood, MdOutlineHomeWork } from "react-icons/md";
import { BsFillPeopleFill } from "react-icons/bs";
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import Company from '@/app/entities/company/company';

interface ItemProps {
  href?: string;
  className?: string;
  children: React.ReactNode;
  onClick?: () => Promise<void>;
}

interface SidebarLinkItemProps {
  href?: string;
  icon: IconType;
  label: string;
  className?: string;
  onClick?: () => Promise<void>;
}

const SidebarLinkItem = ({ icon: Icon, label, href, className, onClick }: SidebarLinkItemProps) => {
  return (
    <Item href={href} className={className} onClick={onClick}>
      {/* Define um tamanho fixo e remove transformações no hover */}
      <Icon style={{ fontSize: '1.5rem', transition: 'none' }} className="text-2xl mr-2.5 flex-shrink-0" />
      <span className="text-left inline-block whitespace-nowrap overflow-hidden group-hover:block hidden transition-all duration-300 group-hover:max-w-xs">
        {label}
      </span>
    </Item>
  );
};


const Item = ({ href, className, children, onClick }: ItemProps) => {
  if (!href) {
    return (
      <div className={className + ` w-full p-2.5 flex items-center transition-colors duration-300 text-white no-underline hover:bg-gray-700 focus:bg-gray-700 cursor-pointer`} onClick={onClick}>
        {children}
      </div>
    )
  }

  return (
    <Link href={href} className={className + ` w-full p-2.5 flex items-center transition-colors duration-300 text-white no-underline hover:bg-gray-700 focus:bg-gray-700`}>
      {children}
    </Link>
  )
}

const Sidebar = () => {
  const signOutToLogin = async () => {
    await signOut({ callbackUrl: '/login', redirect: true });
  }

  const { data } = useSession();
  const [company, setCompany] = useState<Company>(new Company());

  useEffect(() => {
    if (!data?.user.currentCompany) return;

    const companyFound = data?.user.currentCompany as Company;
    setCompany(companyFound);
  }, [data?.user]);

  return (
  <div className="w-16 h-screen bg-gray-800 text-white flex flex-col items-center transition-all duration-300 text-left fixed z-10 group hover:w-52 overflow-hidden">
      <SidebarLinkItem className='h-[8vh]' icon={MdOutlineHomeWork} label={company.trade_name} />
      <SidebarLinkItem icon={FaPlus} label="Novo Pedido" href="/pages/new-order" />
      <SidebarLinkItem icon={TiFlowMerge} label="Processos" href="/pages/order-process" />
      <SidebarLinkItem icon={MdFastfood} label="Cardápio" href="/pages/product" />
      <SidebarLinkItem icon={BsFillPeopleFill} label="Clientes" href="/pages/client" />
      <SidebarLinkItem icon={FaUserTie} label="Funcionários" href="/pages/employee" />
      <SidebarLinkItem icon={FaUserLock} label="Usuários" href="/pages/user" />
      <SidebarLinkItem icon={FaTh} label="Mesas" href="/pages/place" />
      <SidebarLinkItem icon={MdOutlineHomeWork} label="Minha Empresa" href="/" />
      <SidebarLinkItem icon={FaCog} label="Configurações" href="/" />
      <SidebarLinkItem icon={FaRedo} label="Trocar de empresa" href="/access/company-selection" />
      <SidebarLinkItem icon={FaSignOutAlt} label="Sair" onClick={signOutToLogin} />
    </div>
  );
};

export default Sidebar;
