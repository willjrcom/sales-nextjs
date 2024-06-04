'use client';

import Menu from '@/app/components/menu/layout';
import { useSession } from 'next-auth/react';

const Home = () => {
  const { data:session } = useSession();
  return (
    <Menu><h1>Home {session && <p>{session.idToken}</p>}</h1></Menu>
  );
}

export default Home;
