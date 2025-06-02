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
  FaReceipt,
  FaClock,
  FaChartBar,
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
  setHover?: (value: boolean) => void;
}

const AdminSidebar = ({ onToggleAdmin, setHover }: AdminSidebarProps) => {
  const modalHandler = useModal();
  const { data } = useSession();
  const [company, setCompany] = useState<Company>(new Company());

  useEffect(() => {
    if (!data?.user.current_company) return;
    setCompany(data.user.current_company as Company);
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
    <nav
      onMouseEnter={() => setHover?.(true)}
      onMouseLeave={() => setHover?.(false)}
      className="sticky top-0 w-12 hover:w-52 h-screen bg-blue-800 text-white flex flex-col overflow-hidden"
    >
      <SidebarLinkItem icon={MdOutlineHomeWork} label={company.trade_name} onClick={handleCompanyModal} />
      <SidebarLinkItem icon={TiFlowMerge} label="Processos" href="/pages/admin-order-process" />
      <SidebarLinkItem icon={MdFastfood} label="Cardápio" href="/pages/admin-product" />
      <SidebarLinkItem icon={BsFillPeopleFill} label="Clientes" href="/pages/admin-client" />
      <SidebarLinkItem icon={FaUserTie} label="Funcionários" href="/pages/admin-employee" />
      <SidebarLinkItem icon={FaUserLock} label="Usuários" href="/pages/admin-user" />
      <SidebarLinkItem icon={FaTh} label="Mesas" href="/pages/admin-place" />
      <SidebarLinkItem icon={FaPlus} label="Pedidos" href="/pages/admin-order" />
      <SidebarLinkItem icon={FaClock} label="Turnos" href="/pages/admin-shift" />
      <SidebarLinkItem icon={FaChartBar} label="Relatórios" href="/pages/admin-report" />
      <SidebarLinkItem icon={FaRedo} label="Trocar de empresa" href="/access/company-selection" />
      <div className="mt-auto flex flex-col">
        <SidebarLinkItem icon={FaTools} label="User Mode" onClick={onToggleAdmin} />
        <SidebarLinkItem icon={FaSignOutAlt} label="Sair" onClick={signOutToLogin} />
      </div>
    </nav>
  );
};

export default AdminSidebar;