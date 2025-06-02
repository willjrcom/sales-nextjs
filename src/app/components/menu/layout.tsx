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
  const [isHover, setIsHover] = useState(false);

  return (
    <ContextProviders>
      <div className="relative flex overflow-hidden h-screen">
        {/* Sidebars with slide transition */}
        <div className={
          `absolute inset-y-0 left-0 w-12 hover:w-52 transition-all duration-300 ease-in-out ` +
          (adminMode ? 'translate-x-0 z-20' : '-translate-x-full z-10')
        }>
          <AdminSidebar onToggleAdmin={() => setAdminMode(false)} setHover={setIsHover} />
        </div>

        <div className={
          `absolute inset-y-0 left-0 w-12 hover:w-52 transition-all duration-300 ease-in-out ` +
          (adminMode ? '-translate-x-full z-10' : 'translate-x-0 z-20')
        }>
          <Sidebar onToggleAdmin={() => setAdminMode(true)} setHover={setIsHover} />
        </div>

        <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${isHover ? 'ml-52' : 'ml-12'}`}>
          <Topbar />
          <main className="p-4 h-[90vh] min-w-[90vw] flex justify-center">
            <div className="bg-white p-6 rounded-md shadow-md overflow-y-auto max-w-[90vw] h-full box-border">
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
