'use client';

import { useRouter } from 'next/navigation';

const LoginForm = () => {
  const router = useRouter();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Aqui você pode adicionar a lógica de autenticação
    router.push('/pages/company-selection');
  }

  return (
    <div className="flex h-screen">
      <div className="w-1/2 bg-yellow-500 relative">
        <img src="/img_login.jpg" alt="Login" className="w-full h-full object-cover" />
        <div className="absolute bottom-5 left-5 bg-black bg-opacity-50 p-5 rounded text-white">
          <h2 className="text-2xl mb-2">Lorem ipsum dolor sit</h2>
          <p>Lorem ipsum dolor sit amet consectetur. Pellentesque egestas nunc a nunc congue. Consectetur augue potenti pellentesque est nulla lorem.</p>
        </div>
      </div>
      <div className="w-1/2 flex items-center justify-center bg-white">
        <div className="w-full max-w-md px-8 py-10">
          <h2 className="text-2xl mb-6">Conecte-se</h2>
          <form className="flex flex-col" onSubmit={handleSubmit}>
            <label htmlFor="email" className="mb-2 text-gray-700">Email</label>
            <input type="email" id="email" name="email" placeholder="Email" className="mb-4 p-3 border border-gray-300 rounded" required />
            
            <label htmlFor="password" className="mb-2 text-gray-700">Senha</label>
            <input type="password" id="password" name="password" placeholder="Senha" className="mb-4 p-3 border border-gray-300 rounded" required />
            
            <div className="flex items-center mb-4">
              <input type="checkbox" id="remember" name="remember" className="mr-2" />
              <label htmlFor="remember" className="text-gray-700">Lembrar conexão</label>
            </div>
            
            <button type="submit" className="w-full py-3 bg-yellow-500 text-white rounded hover:bg-yellow-600">Conectar</button>
            
            <div className="flex justify-between mt-4 text-yellow-500">
              <a href="#" className="hover:underline">Esqueceu a senha?</a>
              <a href="#" className="hover:underline">Alterar senha</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default LoginForm;