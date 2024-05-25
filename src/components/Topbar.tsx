import React from 'react';
import Link from 'next/link';

interface TopbarItemProps {
  label: string;
  href: string;
}

const TopbarItem: React.FC<TopbarItemProps> = ({ label, href }) => (
  <Link href={href}>
    <div className="hover:underline">{label}</div>
  </Link>
);

const Topbar: React.FC = () => (
  <div className="w-full h-16 bg-gray-800 text-white flex items-center justify-between px-4">
    <div className="text-lg font-bold">My App</div>
    <div className="flex space-x-4">
      <TopbarItem label="Home" href="/" />
      <TopbarItem label="Profile" href="/profile" />
      <TopbarItem label="Settings" href="/settings" />
    </div>
  </div>
);

export default Topbar;
