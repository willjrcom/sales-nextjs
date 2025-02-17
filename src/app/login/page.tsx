'use client';

import { signIn } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { TextField } from '../components/modal/field';
import PasswordField from '../components/modal/fields/password';

const LoginForm = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  if (!isMounted) {
    return null; // Evita renderizar HTML até o componente estar pronto
  }

  const handleSubmit = async () => {
    setError(''); // Reset error state before attempting sign-in

    try {
      const res = await signIn('credentials', {
        redirect: false,
        callbackUrl: '/access/company-selection',
        email,
        password,
      });

      if (res?.error) {
        setError(res.error);
        return;
      }

      // Redirect on successful login
      if (res?.ok) {
        router.push('/access/company-selection');
      }

    } catch (error) {
      setError('Algo deu errado: ' + error);
    }
  };

  return (
    <div className="flex h-screen">
      <div className="w-1/2 bg-yellow-500 relative">
        <Image src="/img_login.jpg" alt="Login" fill style={{ objectFit: 'cover' }} />
        <div className="absolute bottom-5 left-5 bg-black bg-opacity-50 p-5 rounded text-white">
          <h2 className="text-2xl mb-2">GazalTech</h2>
          <p>Conecte-se a sua conta.</p>
        </div>
      </div>

      <div className="w-1/2 flex items-center justify-center bg-white">
        <div className="w-full max-w-md px-8 py-10">
          <h2 className="text-2xl mb-6">Conecte-se</h2>
          {error && <p className="mb-4 text-red-500">{error}</p>}
          <div className="flex flex-col">
            <TextField friendlyName='Email' name='email' placeholder='Digite seu email' setValue={setEmail} value={email} />

            <PasswordField friendlyName='Senha' name='password' placeholder='Digite sua senha' setValue={setPassword} value={password} />

            <div className="flex items-center mb-4">
              <input type="checkbox" id="remember" name="remember" className="mr-2" />
              <label htmlFor="remember" className="text-gray-700">Lembrar conexão</label>
            </div>

            <button onClick={handleSubmit} className="w-full py-3 bg-yellow-500 text-white rounded hover:bg-yellow-600">Conectar</button>

            <div className="flex justify-between mt-4 text-yellow-500">
              <Link href="/login/forget-password" className="hover:underline">Esqueceu a senha?</Link>
              <Link href="/login/sign-up" className="hover:underline">Novo usuário</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
