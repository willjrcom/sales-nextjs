'use client';

import './globals.css';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { AppProps } from 'next/app';

const Menu= () => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="p-4">
        </main>
      </div>
    </div>
  );
}

export default Menu;
