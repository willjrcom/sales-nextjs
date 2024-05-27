'use client';

import './globals.css';
import Sidebar from '../../../components/sidebar/sidebar';
import Topbar from '../../../components/topbar/topbar';
import { AppProps } from 'next/app';

const Menu= () => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="p-4">
          <div className="text-2xl font-bold">Home</div>
        </main>
      </div>
    </div>
  );
}

export default Menu;
