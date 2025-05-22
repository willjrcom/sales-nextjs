import Sidebar from '../sidebar/sidebar';
import Topbar from '../topbar/topbar';
import { Provider } from 'react-redux';
import { ModalProvider } from '@/app/context/modal/context';
import { CurrentOrderProvider } from '@/app/context/current-order/context';
import { GroupItemProvider } from '@/app/context/group-item/context';
import { persistor, RootState, store } from '@/redux/store';
import { useRef } from 'react';
import { PersistGate } from 'redux-persist/integration/react';

const Menu = ({ children }: Readonly<{ children: React.ReactNode }>) => {
  return (
    <ContextProviders>
      <div className="flex">
        <Sidebar />
        <div className="flex-1 flex flex-col ml-52">
          <Topbar />
          <main className="p-4 h-[89vh] min-w-0 max-w-[94vw] flex justify-center">
            <div className="bg-white p-6 rounded-md shadow-md overflow-y-auto">
              <div className="min-w-[80vw]">{children}</div>
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
