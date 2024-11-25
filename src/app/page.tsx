'use client';

import Menu from '@/app/components/menu/layout';
import { useSession } from 'next-auth/react';

const Home = () => {
  const { data, status } = useSession();
  return (
    <h1>Home {data && <p>{status}</p>}</h1>
  );
}

export default Home;
