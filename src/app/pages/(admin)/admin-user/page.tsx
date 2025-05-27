 'use client';

 import PageTitle from '@/app/components/PageTitle';

 export default function AdminUserPage() {
   return (
     <div className="p-4 ml-52">
       <PageTitle title="Usuários" tooltip="Relatórios de Usuários" />
       <p>Não há relatórios disponíveis para Usuários.</p>
     </div>
   );
 }