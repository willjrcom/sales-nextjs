import { redirect } from 'next/navigation';

const Home = () => {
  // Server-side redirect to avoid hydration mismatch
  redirect('/login');
}

export default Home;
