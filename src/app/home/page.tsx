import Link from 'next/link';

const Home = () => {
  return (
    <>
      <head>
        <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
        <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&amp;display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet" />

      </head >
      <body className="bg-white text-brand-dark transition-colors duration-300">
        <header className="sticky top-0 z-50 glass-header border-b border-brand-dark/5">
          <div className="container mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative w-10 h-10 flex items-center justify-center">
                <span className="material-symbols-outlined text-brand-red text-4xl font-bold">restaurant</span>
                <div className="absolute inset-0 border-4 border-accent-red rounded-full flex items-center justify-center"></div>
              </div>
              <span className="text-2xl font-extrabold tracking-tighter text-brand-dark">GFood</span>
            </div>
            <nav className="hidden md:flex items-center space-x-10 text-sm font-bold uppercase tracking-widest">
              <a className="hover:text-brand-red transition-colors" href="#features">Funcionalidades</a>
              <a className="hover:text-brand-red transition-colors" href="#order-types">Tipos de Pedido</a>
              <a className="hover:text-brand-red transition-colors" href="#contact">Contato</a>
            </nav>
            <div className="flex items-center space-x-4">
              <Link href="/login" className="px-6 py-2.5 rounded-lg font-bold text-brand-dark hover:bg-brand-dark/5 transition-all">
                Entrar
              </Link>
              <Link href="/login/sign-up" className="px-6 py-2.5 rounded-lg bg-brand-red text-white font-bold hover:shadow-lg hover:bg-red-700 transition-all">
                Cadastrar
              </Link>
            </div>
          </div>
        </header>
        <main>
          <section className="relative bg-brand-yellow py-24 lg:py-32 overflow-hidden">
            <div className="container mx-auto px-6 relative z-10">
              <div className="flex flex-col lg:flex-row items-center gap-16">
                <div className="w-full lg:w-1/2 text-center lg:text-left">
                  <span className="inline-block py-1.5 px-4 rounded-full bg-brand-dark text-brand-yellow text-xs font-black uppercase tracking-widest mb-6">
                    Gestão Industrial de Vendas
                  </span>
                  <h1 className="text-5xl lg:text-7xl font-extrabold text-brand-dark leading-none mb-6">
                    Transforme sua gestão de pedidos com <span className="text-brand-red">GFood</span>
                  </h1>
                  <p className="text-xl text-brand-dark/80 mb-10 max-w-xl font-medium">
                    Otimize sua linha de produção com o sistema de vendas industrial mais completo do mercado. Controle total desde a recepção até a logística final.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                    <Link href="/login/sign-up" className="px-10 py-5 bg-brand-dark text-white rounded-xl font-black text-lg hover:scale-105 transition-transform shadow-2xl inline-block text-center">
                      Começar agora
                    </Link>
                    {/* <button className="px-10 py-5 bg-white border-2 border-brand-dark/10 rounded-xl font-black text-lg hover:bg-white/90 transition-colors flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined">play_circle</span>
                      Ver demo
                    </button> */}
                  </div>
                </div>
                <div className="w-full lg:w-1/2">
                  <div className="relative rounded-3xl overflow-hidden shadow-2xl border-8 border-brand-dark/10 rotate-2 hover:rotate-0 transition-transform duration-500">
                    <div className="bg-white p-4 flex items-center space-x-2 border-b border-gray-100">
                      <div className="flex space-x-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      </div>
                    </div>
                    <img className="w-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAOloi_C_cFdO28qPkG2Sr2QwBjCr4ITyuMPkDhjJIi5VpUqZgoI3UmxzBnYRKxNpzpBcQ19sfrYIPgR7181ovl5Nu6efEOUrjV-Z-sEONdwYO7I8EndTu-JYONvFEU9AQwFOTEZ8Hp3VSiQ5eu7MfSlCxlvYjEUiNGaESV4EFufEsoQkOvB7cAKt5C0af5Mfzfs8_Gc2DKYbnHiYmaFxsyA9VQB7ZruLbljykouyC4qHR7ZseBbUQzta2fZIDkHwNtSpeG0EoncpY" />
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section className="py-24 bg-white" id="features">
            <div className="container mx-auto px-6">
              <div className="text-center max-w-2xl mx-auto mb-20">
                <h2 className="text-4xl lg:text-5xl font-black mb-6 text-brand-dark">Soluções para cada Canal</h2>
                <div className="w-24 h-2 bg-brand-yellow mx-auto mb-6 rounded-full"></div>
                <p className="text-brand-dark/60 text-lg">Integramos todos os seus pontos de venda em uma única interface robusta e inteligente.</p>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="p-10 bg-neutral-soft rounded-3xl border-b-8 border-transparent hover:border-primary transition-all hover:-translate-y-2 group">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-brand-yellow text-4xl font-bold">restaurant_menu</span>
                  </div>
                  <h3 className="text-2xl font-black mb-4 text-brand-dark">Gestão de Mesa</h3>
                  <p className="text-brand-dark/60 mb-8 leading-relaxed">Gestão das mesas disponíveis, controle de ocupação e troca de mesas.</p>
                  <ul className="space-y-4">
                    <li className="flex items-center gap-3 font-bold text-sm"><span className="material-symbols-outlined text-brand-red">check_circle</span> Mapa de salão com a posição das mesas</li>
                    <li className="flex items-center gap-3 font-bold text-sm"><span className="material-symbols-outlined text-brand-red">check_circle</span> Separação por cada ambiente</li>
                  </ul>
                </div>
                <div className="p-10 bg-neutral-soft rounded-3xl border-b-8 border-transparent hover:border-primary transition-all hover:-translate-y-2 group">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-brand-yellow text-4xl font-bold">storefront</span>
                  </div>
                  <h3 className="text-2xl font-black mb-4 text-brand-dark">Balcão/Retirada</h3>
                  <p className="text-brand-dark/60 mb-8 leading-relaxed">Fila de espera otimizada, painel de chamadas e facilidade ao tirar iniciar o pedido.</p>
                  <ul className="space-y-4">
                    <li className="flex items-center gap-3 font-bold text-sm"><span className="material-symbols-outlined text-brand-red">check_circle</span> Checkout rápido</li>
                    <li className="flex items-center gap-3 font-bold text-sm"><span className="material-symbols-outlined text-brand-red">check_circle</span> Alertas via WhatsApp</li>
                  </ul>
                </div>
                <div className="p-10 bg-neutral-soft rounded-3xl border-b-8 border-transparent hover:border-primary transition-all hover:-translate-y-2 group">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-brand-yellow text-4xl font-bold">delivery_dining</span>
                  </div>
                  <h3 className="text-2xl font-black mb-4 text-brand-dark">Entrega/Delivery</h3>
                  <p className="text-brand-dark/60 mb-8 leading-relaxed">Logística inteligente com envio e recebimento do pedido.</p>
                  <ul className="space-y-4">
                    <li className="flex items-center gap-3 font-bold text-sm"><span className="material-symbols-outlined text-brand-red">check_circle</span> Envio de pedidos em lote</li>
                    <li className="flex items-center gap-3 font-bold text-sm"><span className="material-symbols-outlined text-brand-red">check_circle</span> Controle da entrega de cada motoboy</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
          <section className="py-24 bg-brand-dark text-white" id="api-status">
            <div className="container mx-auto px-6">
              <div className="flex flex-col lg:flex-row items-center gap-20">
                <div className="w-full lg:w-1/2 order-2 lg:order-1">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-white/5 p-8 rounded-3xl border border-white/10 hover:bg-white/10 transition-colors">
                      <span className="text-brand-yellow text-4xl font-black block mb-2">98%</span>
                      <p className="text-sm font-bold uppercase tracking-widest text-white/50">Eficiência</p>
                    </div>
                    <div className="bg-brand-yellow p-8 rounded-3xl mt-8">
                      <span className="text-brand-dark text-4xl font-black block mb-2">+2.4k</span>
                      <p className="text-sm font-bold uppercase tracking-widest text-brand-dark/70">Pedidos/Mês</p>
                    </div>
                    <div className="bg-white/5 p-8 rounded-3xl border border-white/10 -mt-4 hover:bg-white/10 transition-colors">
                      <span className="text-brand-yellow text-4xl font-black block mb-2">12min</span>
                      <p className="text-sm font-bold uppercase tracking-widest text-white/50">Prep Médio</p>
                    </div>
                    <div className="bg-brand-red p-8 rounded-3xl mt-4">
                      <span className="text-white text-4xl font-black block mb-2">100%</span>
                      <p className="text-sm font-bold uppercase tracking-widest text-white/70">Sincro</p>
                    </div>
                  </div>
                </div>
                <div className="w-full lg:w-1/2 order-1 lg:order-2">
                  <h2 className="text-4xl lg:text-5xl font-black mb-8 leading-tight">Gestão de Pedidos &amp; Estatísticas Avançadas</h2>
                  <p className="text-lg text-white/70 mb-10 leading-relaxed">
                    Nossa interface de Business Intelligence oferece visão 360º da sua operação. Tome decisões baseadas em dados reais e melhore sua lucratividade.
                  </p>
                  <div className="space-y-8">
                    <div className="flex items-start gap-6">
                      <div className="w-12 h-12 rounded-xl bg-brand-yellow flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-brand-dark font-bold">bar_chart</span>
                      </div>
                      <div>
                        <h4 className="font-black text-xl mb-2">Cadastros e Estatísticas</h4>
                        <p className="text-white/60 leading-relaxed">Mapeamento detalhado de insumos e performance por turno de trabalho.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-6">
                      <div className="w-12 h-12 rounded-xl bg-brand-red flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-white font-bold">monitor_heart</span>
                      </div>
                      <div>
                        <h4 className="font-black text-xl mb-2">Monitoramento Real-time</h4>
                        <p className="text-white/60 leading-relaxed">Status em tempo real de cada pedido desde a entrada até a expedição final.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section className="py-24 bg-neutral-soft" id="integrations">
            <div className="container mx-auto px-6">
              <div className="text-center mb-20">
                <h2 className="text-4xl lg:text-5xl font-black mb-4 text-brand-dark">Fluxo Inteligente de Produção</h2>
                <p className="text-brand-dark/60 text-lg">Como o GFood organiza sua operação industrial de ponta a ponta.</p>
              </div>
              <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative">
                <div className="relative z-10 w-full lg:w-1/4 flex flex-col items-center text-center bg-white p-10 rounded-[2.5rem] shadow-xl border-t-4 border-primary">
                  <div className="w-16 h-16 bg-brand-dark rounded-full flex items-center justify-center text-brand-yellow text-2xl font-black mb-6">1</div>
                  <h4 className="font-black text-xl mb-4 text-brand-dark">Entrada</h4>
                  <p className="text-sm text-brand-dark/60 leading-relaxed">Lançamento do pedido com itens prontos para iniciar o processo de produção.</p>
                </div>
                <div className="relative z-10 w-full lg:w-1/4 flex flex-col items-center text-center bg-white p-10 rounded-[2.5rem] shadow-xl border-t-4 border-accent-red">
                  <div className="w-16 h-16 bg-brand-dark rounded-full flex items-center justify-center text-white text-2xl font-black mb-6">2</div>
                  <h4 className="font-black text-xl mb-4 text-brand-dark">Triagem</h4>
                  <p className="text-sm text-brand-dark/60 leading-relaxed">Processos por categoria direcionam o pedido para o setor correto.</p>
                </div>
                <div className="relative z-10 w-full lg:w-1/4 flex flex-col items-center text-center bg-white p-10 rounded-[2.5rem] shadow-xl border-t-4 border-primary">
                  <div className="w-16 h-16 bg-brand-dark rounded-full flex items-center justify-center text-brand-yellow text-2xl font-black mb-6">3</div>
                  <h4 className="font-black text-xl mb-4 text-brand-dark">Produção</h4>
                  <p className="text-sm text-brand-dark/60 leading-relaxed">KDS (Kitchen Display System) dinamico permite enviar o pedido para um próximo setor.</p>
                </div>
                <div className="relative z-10 w-full lg:w-1/4 flex flex-col items-center text-center bg-white p-10 rounded-[2.5rem] shadow-xl border-t-4 border-accent-red">
                  <div className="w-16 h-16 bg-brand-dark rounded-full flex items-center justify-center text-white text-2xl font-black mb-6">4</div>
                  <h4 className="font-black text-xl mb-4 text-brand-dark">Expedição</h4>
                  <p className="text-sm text-brand-dark/60 leading-relaxed">Controle de cada pedido iniciado e finalizado contabilizando o tempo e responsável da produção.</p>
                </div>
              </div>
            </div>
          </section>
          <section className="py-24 bg-brand-yellow">
            <div className="container mx-auto px-6 text-center">
              <h2 className="text-5xl lg:text-7xl font-black mb-8 text-brand-dark tracking-tighter">Pronto para escalar?</h2>
              <p className="text-2xl text-brand-dark/80 mb-12 max-w-3xl mx-auto font-bold">Junte-se a centenas de empresas que transformaram seu faturamento com GFood.</p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <a href="https://wa.me/5511963849111?text=Ol%C3%A1%2C%20gostaria%20de%20falar%20com%20um%20especialista" target="_blank" className="px-12 py-6 bg-brand-dark text-white rounded-2xl font-black text-xl hover:scale-105 transition-all shadow-2xl inline-block text-center">
                  Falar com um Especialista
                </a>
                <Link href="/login/sign-up" className="px-12 py-6 bg-transparent border-4 border-brand-dark/20 rounded-2xl font-black text-xl hover:bg-brand-dark/10 transition-all text-brand-dark inline-block text-center">
                  Se cadastrar
                </Link>
              </div>
            </div>
          </section>
        </main>
        <footer className="bg-white pt-24 pb-12 border-t border-brand-dark/5" id="contact">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
              <div className="space-y-8">
                <div className="flex items-center space-x-3">
                  <div className="relative w-8 h-8 flex items-center justify-center">
                    <span className="material-symbols-outlined text-brand-red text-2xl font-bold">restaurant</span>
                    <div className="absolute inset-0 border-2 border-accent-red rounded-full"></div>
                  </div>
                  <span className="text-2xl font-black tracking-tighter text-brand-dark">GFood</span>
                </div>
                <p className="text-brand-dark/50 text-base leading-relaxed font-medium">
                  A solução definitiva para gestão de pedidos em larga escala. Tecnologia de ponta para o setor gastronômico industrial.
                </p>
                <div className="flex space-x-4">
                  <a className="w-12 h-12 rounded-xl bg-brand-yellow/10 flex items-center justify-center text-brand-dark hover:bg-brand-yellow transition-all" href="https://www.linkedin.com/in/willjrcom/" target="_blank">
                    <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                  </a>
                </div>
              </div>
              <div>
                <h5 className="font-black text-brand-dark mb-8 uppercase tracking-widest text-sm">Plataforma</h5>
                <ul className="space-y-5 text-brand-dark/60 font-bold">
                  <li><a className="hover:text-brand-red transition-colors" href="#features">Soluções</a></li>
                  <li><a className="hover:text-brand-red transition-colors" href="#api-status">Gestão</a></li>
                  <li><a className="hover:text-brand-red transition-colors" href="#integrations">Produção</a></li>
                </ul>
              </div>
              <div>
                <h5 className="font-black text-brand-dark mb-8 uppercase tracking-widest text-sm">Suporte</h5>
                <ul className="space-y-5 text-brand-dark/60 font-bold">
                  <li><a href="https://wa.me/5511963849111?text=Ol%C3%A1%2C%20gostaria%20de%20falar%20com%20um%20especialista" target="_blank" className="hover:text-brand-red transition-colors">Contato</a></li>
                </ul>
              </div>
              <div>
                <h5 className="font-black text-brand-dark mb-8 uppercase tracking-widest text-sm">Newsletter</h5>
                <p className="text-brand-dark/60 mb-6 font-medium">Receba novidades da gestão industrial.</p>
                <form className="flex flex-col gap-3">
                  <input className="bg-neutral-soft border-none rounded-xl py-4 px-5 focus:ring-4 focus:ring-primary/20 text-sm font-bold" placeholder="Seu e-mail profissional" type="email" />
                  <button className="w-full py-4 bg-brand-dark text-white rounded-xl font-black hover:bg-black transition-all">
                    Inscrever agora
                  </button>
                </form>
              </div>
            </div>
            <div className="border-t border-brand-dark/5 pt-10 flex flex-col md:flex-row justify-between items-center gap-6 text-sm font-black text-brand-dark/40">
              <p>© 2026 GFood Systems. Todos os direitos reservados.</p>
              <div className="flex space-x-10">
                <a className="hover:text-brand-red">Termos de Uso</a>
                <a className="hover:text-brand-red">Privacidade</a>
                <a className="hover:text-brand-red">Cookies</a>
              </div>
            </div>
          </div>
        </footer>
      </body >
    </>
  )
}

export default Home;
