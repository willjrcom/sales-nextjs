import { EmployeeProvider } from '@/app/context/employee/context';
import Sidebar from '../sidebar/sidebar';
import Topbar from '../topbar/topbar';
import { ClientProvider } from '@/app/context/client/context';
import { CategoryProvider } from '@/app/context/category/context';
import { ProductProvider } from '@/app/context/product/context';
import { ProcessRuleProvider } from '@/app/context/process-rule/context';
import { PlaceProvider } from '@/app/context/place/context';
import { TableProvider } from '@/app/context/table/context';
import { OrderProvider } from '@/app/context/order/context';
import { ModalProvider } from '@/app/context/modal/context';
import { CurrentOrderProvider } from '@/app/context/current-order/context';
import { GroupItemProvider } from '@/app/context/group-item/context';

const Menu = ({ children }: Readonly<{ children: React.ReactNode }>) => {
  return (
    <ContextProviders>
      <div className="flex">
        <Sidebar />
        <div className="flex-1 flex flex-col ml-[65px]">
          <Topbar />
          <main className="p-4 h-[89vh] min-w-0 max-w-full flex justify-center">
            <div className="bg-white p-6 rounded-md shadow-md overflow-y-auto ">
              <div className='min-w-[80vw] max-w-[90vw]'>
              {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </ContextProviders>
  );
}

const ContextProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <EmployeeProvider>
      <ClientProvider>
        <CategoryProvider>
          <ProductProvider>
            <ProcessRuleProvider>
              <PlaceProvider>
                <TableProvider>
                  <OrderProvider>
                    <CurrentOrderProvider>
                      <GroupItemProvider>
                        <ModalProvider>
                          {children}
                        </ModalProvider>
                      </GroupItemProvider>
                    </CurrentOrderProvider>
                  </OrderProvider>
                </TableProvider>
              </PlaceProvider>
            </ProcessRuleProvider>
          </ProductProvider>
        </CategoryProvider>
      </ClientProvider>
    </EmployeeProvider>
  )
}

export default Menu;
