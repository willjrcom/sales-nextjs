import React, { useEffect, useState } from 'react';
import { IconType } from 'react-icons';
import { FaUserTie, FaPlus, FaSignOutAlt, FaRedo, FaUserLock, FaTh, FaSlidersH, FaTools } from 'react-icons/fa';
import { TiFlowMerge } from 'react-icons/ti';
import { MdFastfood, MdOutlineHomeWork } from "react-icons/md";
import { BsFillPeopleFill } from "react-icons/bs";
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import Company from '@/app/entities/company/company';
import { useModal } from '@/app/context/modal/context';
import CompanyForm from '@/app/forms/company/form';


interface SidebarLinkItemProps {
  href?: string;
  icon: IconType;
  label: string;
  /**
   * onClick may be sync (void) or async (Promise<void>)
   */
  onClick?: () => void | Promise<void>;
}

const SidebarLinkItem = ({ href, icon: Icon, label, onClick }: SidebarLinkItemProps) => {
  const baseClasses =
    'flex items-center w-full p-3 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors duration-200';
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



interface SidebarProps {
  onToggleAdmin?: () => void;
  setHover?: (value: boolean) => void
}

const Sidebar = ({ onToggleAdmin, setHover }: SidebarProps) => {
  const modalHandler = useModal()

  const signOutToLogin = async () => {
    await signOut({ callbackUrl: '/login', redirect: true });
  }

  const { data } = useSession();
  const [company, setCompany] = useState<Company>(new Company());

  useEffect(() => {
    if (!data?.user.current_company) return;

    const companyFound = data?.user.current_company as Company;
    setCompany(companyFound);
  }, [data?.user]);

  const handleCompanyModal = async () => {
    const onClose = () => {
      modalHandler.hideModal("edit-company-" + company.id)
    }

    modalHandler.showModal("edit-company-" + company.id, "Editar Empresa", <CompanyForm item={company} isUpdate />, "md", onClose)
  }

  return (
    <nav
      onMouseEnter={() => setHover?.(true)}
      onMouseLeave={() => setHover?.(false)}
      className="sticky top-0 w-12 hover:w-52 h-screen bg-gray-800 text-white flex flex-col overflow-hidden transition-all duration-300 ease-in-out"
    >
      <SidebarLinkItem icon={MdOutlineHomeWork} label={company.trade_name} onClick={handleCompanyModal} />
      <SidebarLinkItem icon={FaPlus} label="Novo Pedido" href="/pages/new-order" />
      <SidebarLinkItem icon={TiFlowMerge} label="Processos" href="/pages/order-process" />
      <SidebarLinkItem icon={MdFastfood} label="Cardápio" href="/pages/product" />
      <SidebarLinkItem icon={BsFillPeopleFill} label="Clientes" href="/pages/client" />
      <SidebarLinkItem icon={FaUserTie} label="Funcionários" href="/pages/employee" />
      <SidebarLinkItem icon={FaUserLock} label="Usuários" href="/pages/user" />
      <SidebarLinkItem icon={FaTh} label="Mesas" href="/pages/place" />
      <SidebarLinkItem icon={FaRedo} label="Trocar de empresa" href="/access/company-selection" />
      <div className="mt-auto flex flex-col">
        {onToggleAdmin && (
          <SidebarLinkItem icon={FaTools} label="Admin Mode" onClick={onToggleAdmin} />
        )}
        <SidebarLinkItem icon={FaSignOutAlt} label="Sair" onClick={signOutToLogin} />
      </div>
    </nav>
  );
};

export default Sidebar;
