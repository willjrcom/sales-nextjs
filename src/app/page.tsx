'use client';

import { useRouter } from 'next/router';
import './globals.css';
import Menu from './menu';

const Home= () => {
  const router = useRouter();

  return (
    <div className="flex">
      <Menu  />
    </div>
  );
}

export default Home;
