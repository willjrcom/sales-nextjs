'use client';

import { signIn } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import Loading from '../components/loading/Loading';
import { TextField } from '../components/modal/field';
import PasswordField from '../components/modal/fields/password';
import { Button } from '@/components/ui/button';
import { notifyError } from '../utils/notifications';
import { translateError } from '../utils/error';

import { Suspense } from 'react';

const LoginFormContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState<boolean>(false);
  const [remember, setRemember] = useState<boolean>(false);

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const res = await signIn('credentials', {
        redirect: false,
        callbackUrl: '/access/company-selection',
        email,
        password,
        remember,
      });


      if (res?.error) {
        notifyError(translateError(res.error));
        console.log(res);
        return;
      }

      // Redirect on successful login
      const q = searchParams.get('q');
      if (q) {
        try {
          const id = atob(q);
          router.push(`/access/company-selection?company_id=${id}`);
        } catch (e) {
          router.push('/access/company-selection');
        }
      } else {
        router.push('/access/company-selection');
      }

    } catch (err) {
      notifyError('Algo deu errado: ' + err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row h-screen overflow-hidden" suppressHydrationWarning>
      <div className="w-full sm:w-1/2 bg-yellow-500 relative h-[40vh] sm:h-screen flex-shrink-0">
        <Image
          src="/icons/logo.png"
          alt="Login"
          fill
          style={{ objectFit: 'cover', objectPosition: 'center' }}
          unoptimized
          priority
        />
        <div className="absolute bottom-5 left-5 bg-black bg-opacity-50 p-5 rounded text-white z-10 hidden sm:block">
          <h2 className="text-2xl mb-2">GazalTech</h2>
          <p>Conecte-se a sua conta.</p>
        </div>
      </div>

      <div className="w-full sm:w-1/2 flex items-center justify-center bg-white flex-1 overflow-y-auto">
        <div className="w-full max-w-md px-8 py-10">
          <h2 className="text-2xl mb-6 hidden sm:block">Conecte-se</h2>
          <div className="flex flex-col">
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
              <TextField friendlyName='Email' name='email' placeholder='Digite seu email' setValue={setEmail} value={email} />

              <PasswordField friendlyName='Senha' name='password' placeholder='Digite sua senha' setValue={setPassword} value={password} />

              <div className="flex items-center mb-4 hidden sm:flex">
                <input
                  type="checkbox"
                  id="remember"
                  name="remember"
                  className="mr-2"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <label htmlFor="remember" className="text-gray-700">Lembrar conexão</label>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={loading}
              >
                {loading ? <Loading /> : 'Conectar'}
              </Button>
            </form>

            <div className="flex flex-col sm:flex-row justify-between gap-2 sm:gap-0 mt-4 text-yellow-500">
              <Link href="/login/forget-password" className="hover:underline text-center sm:text-left">Esqueceu a senha?</Link>
              <Link href="/login/sign-up" className="hover:underline text-center sm:text-left">Novo usuário</Link>
            </div>
            <Link href="/home" className="fixed bottom-6 right-6 z-50 px-6 py-3 bg-white/90 backdrop-blur shadow-lg rounded-full font-bold text-brand-dark hover:scale-105 hover:shadow-xl transition-all flex items-center gap-2 group">
              <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform">arrow_back</span>
              Voltar para home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const LoginForm = () => {
  return (
    <Suspense fallback={<Loading />}>
      <LoginFormContent />
    </Suspense>
  );
};

export default LoginForm;
