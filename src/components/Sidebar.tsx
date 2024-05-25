import React from 'react';
import Link from 'next/link';
import { FaHome, FaUser, FaCog } from 'react-icons/fa';

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, href }) => (
  <Link href={href}>
    <div className="flex items-center p-4 hover:bg-gray-700 transition-colors duration-200">
      <div className="w-12">{icon}</div>
      <div className="ml-2">{label}</div>
    </div>
  </Link>
);

const Sidebar: React.FC = () => (
  <div className="h-screen w-64 bg-gray-800 text-white">
    <div className="flex flex-col">
      <SidebarItem icon={<FaHome />} label="Home" href="/" />
      <SidebarItem icon={<FaUser />} label="Profile" href="/profile" />
      <SidebarItem icon={<FaCog />} label="Settings" href="/settings" />
    </div>
  </div>
);

export default Sidebar;
