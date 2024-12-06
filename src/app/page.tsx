'use client';

import Menu from '@/app/components/menu/layout';
import { useSession } from 'next-auth/react';
import Kanban from './components/kanban/kanban';

const Home = () => {
  const { data, status } = useSession();
  return (
    <Menu>
      <h1>Home {data && <p>{status}</p>}</h1>
      <Kanban />
    </Menu>
  );
}

export default Home;
