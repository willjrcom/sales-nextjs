'use client';

import Menu from '@/app/components/menu/layout';
import { useSession } from 'next-auth/react';

const Home = () => {
  const { data } = useSession();
  return (
    <Menu><h1>Home {data && <p>{data.idToken}</p>}</h1></Menu>
  );
}

export default Home;
