'use client';

import Menu from '@/app/components/menu/layout';
import { useSession } from 'next-auth/react';

const Home = () => {
  const { data, status } = useSession();
  return (
    <Menu>
      <h1>Home {data && <p>{status}</p>}</h1>
    </Menu>
  );
}

export default Home;
