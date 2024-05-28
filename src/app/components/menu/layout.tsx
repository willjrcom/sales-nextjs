'use client';

import Sidebar from '../sidebar/sidebar';
import Topbar from '../topbar/topbar';

const Menu = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>)  => {
  return (
    <body className="flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="p-4">
          {children}
        </main>
      </div>
    </body>
  );
}

export default Menu;
