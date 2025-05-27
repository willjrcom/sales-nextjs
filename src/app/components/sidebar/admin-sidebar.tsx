import React, { useEffect, useState } from 'react';
import { IconType } from 'react-icons';
import {
  FaUserTie,
  FaPlus,
  FaSignOutAlt,
  FaRedo,
  FaUserLock,
  FaTh,
  FaSlidersH,
  FaTools,
} from 'react-icons/fa';
import { TiFlowMerge } from 'react-icons/ti';
import { MdFastfood, MdOutlineHomeWork } from 'react-icons/md';
import { BsFillPeopleFill } from 'react-icons/bs';
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import Company from '@/app/entities/company/company';
import { useModal } from '@/app/context/modal/context';
import CompanyForm from '@/app/forms/company/form';

interface SidebarLinkItemProps {
  href?: string;
  icon: IconType;
  label: string;
  onClick?: () => void;
}

const SidebarLinkItem = ({ href, icon: Icon, label, onClick }: SidebarLinkItemProps) => {
  const baseClasses =
    'flex items-center w-full p-3 text-white hover:bg-blue-700 rounded-md transition-colors duration-200';
  const content = (
    <>
      <Icon className="text-2xl flex-shrink-0" />
      <span className="ml-3">{label}</span>
    </>
  );
  if (href) {
    return (
      <Link href={href} className={baseClasses}>
        {content}
      </Link>
    );
  }
  return (
    <button onClick={onClick} className={baseClasses + ' text-left'}>
      {content}
    </button>
  );
};

interface AdminSidebarProps {
  onToggleAdmin?: () => void;
}

const AdminSidebar = ({ onToggleAdmin }: AdminSidebarProps) => {
  const modalHandler = useModal();
  const { data } = useSession();
  const [company, setCompany] = useState<Company>(new Company());

  useEffect(() => {
    if (!data?.user.currentCompany) return;
    setCompany(data.user.currentCompany as Company);
  }, [data?.user]);

  const handleCompanyModal = () => {
    const onClose = () => {
      modalHandler.hideModal(`edit-company-${company.id}`);
    };
    modalHandler.showModal(
      `edit-company-${company.id}`,
      'Editar Empresa',
      <CompanyForm item={company} isUpdate />,
      'md',
      onClose
    );
  };

  const signOutToLogin = async () => {
    await signOut({ callbackUrl: '/login', redirect: true });
  };

  return (
    <nav className="w-52 min-h-screen bg-blue-800 text-white flex flex-col fixed z-10 overflow-y-auto">
      <SidebarLinkItem icon={MdOutlineHomeWork} label={company.trade_name} onClick={handleCompanyModal} />
      <SidebarLinkItem icon={TiFlowMerge} label="Processos" href="/pages/order-process" />
      <SidebarLinkItem icon={MdFastfood} label="Cardápio" href="/pages/product" />
      <SidebarLinkItem icon={BsFillPeopleFill} label="Clientes" href="/pages/client" />
      <SidebarLinkItem icon={FaUserTie} label="Funcionários" href="/pages/employee" />
      <SidebarLinkItem icon={FaUserLock} label="Usuários" href="/pages/user" />
      <SidebarLinkItem icon={FaTh} label="Mesas" href="/pages/place" />
      <SidebarLinkItem icon={MdOutlineHomeWork} label="Minha Empresa" href="/" />
      <SidebarLinkItem icon={FaSlidersH} label="Configurações" href="/" />
      <SidebarLinkItem icon={FaRedo} label="Trocar de empresa" href="/access/company-selection" />
      <SidebarLinkItem icon={FaTools} label="User Mode" onClick={onToggleAdmin} />
      <SidebarLinkItem icon={FaSignOutAlt} label="Sair" onClick={signOutToLogin} />
    </nav>
  );
};

export default AdminSidebar;