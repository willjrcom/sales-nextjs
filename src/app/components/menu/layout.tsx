"use client";
import React, { useState } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '../sidebar/app-sidebar';
import Topbar from '../topbar/topbar';
import { ModalProvider } from '@/app/context/modal/context';

const Menu = ({ children }: Readonly<{ children: React.ReactNode }>) => {
  const [adminMode, setAdminMode] = useState(false);

  return (
    <ModalProvider>
      <SidebarProvider defaultOpen={false}>
        <AppSidebar adminMode={adminMode} toggleAdminMode={() => setAdminMode(!adminMode)} />
        <SidebarInset>
          <Topbar />
          <main className="p-4 h-[calc(100vh-3.5rem)] flex justify-center bg-gray-100 dark:bg-zinc-950">
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-md shadow-md overflow-y-auto w-full max-w-[95vw] h-full box-border">
              {children}
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </ModalProvider>
  );
}

export default Menu;
