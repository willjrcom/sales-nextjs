import Sidebar from '../sidebar/sidebar';
import AdminSidebar from '../sidebar/admin-sidebar';
import Topbar from '../topbar/topbar';
import { Provider } from 'react-redux';
import { ModalProvider } from '@/app/context/modal/context';
import { CurrentOrderProvider } from '@/app/context/current-order/context';
import { GroupItemProvider } from '@/app/context/group-item/context';
import { persistor, RootState, store } from '@/redux/store';
import { useRef } from 'react';
import { PersistGate } from 'redux-persist/integration/react';

import { useState } from 'react';
const Menu = ({ children }: Readonly<{ children: React.ReactNode }>) => {
  const [adminMode, setAdminMode] = useState(false);
  return (
    <ContextProviders>
      <div className="relative flex overflow-hidden h-screen">
        {/* Sidebars with slide transition */}
        <div className={
          `absolute inset-y-0 left-0 w-52 transition-transform duration-300 ease-in-out ` +
          (adminMode ? 'translate-x-0 z-20' : '-translate-x-full z-10')
        }>
          <AdminSidebar onToggleAdmin={() => setAdminMode(false)} />
        </div>
        <div className={
          `absolute inset-y-0 left-0 w-52 transition-transform duration-300 ease-in-out ` +
          (adminMode ? '-translate-x-full z-10' : 'translate-x-0 z-20')
        }>
          <Sidebar onToggleAdmin={() => setAdminMode(true)} />
        </div>
        <div className="flex-1 flex flex-col ml-52">
          <Topbar />
          <main className="p-4 h-[89vh] min-w-0 flex justify-center w-full">
            <div className="bg-white p-6 rounded-md shadow-md overflow-y-auto w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ContextProviders>
  );
}

const ContextProviders = ({ children }: { children: React.ReactNode }) => {
  const storeRef = useRef<RootState>();
  if (!storeRef.current) {
    storeRef.current = store.getState();
  }

  return (
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        <CurrentOrderProvider>
          <GroupItemProvider>
            <ModalProvider>
              {children}
            </ModalProvider>
          </GroupItemProvider>
        </CurrentOrderProvider>
      </PersistGate>
    </Provider>
  )
}

export default Menu;
