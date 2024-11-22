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

const Menu = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <EmployeeProvider>
      <ClientProvider>
        <CategoryProvider>
          <ProductProvider>
            <ProcessRuleProvider>
              <PlaceProvider>
                <TableProvider>
                  <OrderProvider>
                    <div className="flex">
                      <Sidebar />
                      <div className="flex-1 flex flex-col">
                        <Topbar />
                        <main className="p-4">
                          {children}
                        </main>
                      </div>
                    </div>
                  </OrderProvider>
                </TableProvider>
              </PlaceProvider>
            </ProcessRuleProvider>
          </ProductProvider>
        </CategoryProvider>
      </ClientProvider>
    </EmployeeProvider>
  );
}

export default Menu;
