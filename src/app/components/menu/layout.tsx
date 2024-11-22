import { EmployeeProvider } from '@/app/context/employee/context';
import Sidebar from '../sidebar/sidebar';
import Topbar from '../topbar/topbar';
import { ClientProvider } from '@/app/context/client/context';
import { CategoryProvider } from '@/app/context/category/context';
import { ProductProvider } from '@/app/context/product/context';
import { ProcessRuleProvider } from '@/app/context/process-rule/context';

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
              <div className="flex">
                <Sidebar />
                <div className="flex-1 flex flex-col">
                  <Topbar />
                  <main className="p-4">
                    {children}
                  </main>
                </div>
              </div>
            </ProcessRuleProvider>
          </ProductProvider>
        </CategoryProvider>
      </ClientProvider>
    </EmployeeProvider>
  );
}

export default Menu;
