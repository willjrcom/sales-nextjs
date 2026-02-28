'use client';

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import CrudLayout from "@/app/components/crud/crud-layout";
import CrudTable from "@/app/components/crud/table";
import Loading from "@/app/components/loading/Loading";
import Company from "@/app/entities/company/company";
import ListPublicCompanies from "@/app/api/public/companies";
import ListPublicUsers from "@/app/api/public/users";
import Link from "next/link";
import { getCompanyColumns } from "./company-columns";
import { userColumns } from "./user-columns";
import { useRouter } from "next/navigation";
import { getWhitelist } from "@/app/utils/whitelist";
import { useQuery } from "@tanstack/react-query";
import Refresh, { FormatRefreshTime } from "@/app/components/crud/refresh";
import GetAllCompanyCategories from "@/app/api/company-category/list";
import { CompanyCategoryColumns } from "./company-category-columns";
import { SponsorColumns } from "./sponsor-columns";
import { AdvertisingColumns } from "./advertising-columns";
import CompanyCategoryForm from "@/app/forms/company-category/form";
import SponsorForm from "@/app/forms/sponsor/form";
import AdvertisingForm from "@/app/forms/advertising/form";
import { ModalProvider } from "@/app/context/modal/context";
import { FaPlus } from "react-icons/fa";
import ButtonIconText from "@/app/components/button/button-icon-text";
import GetAllSponsors from "@/app/api/sponsor/list";
import GetAllAdvertisements from "@/app/api/advertising/list";

const SectionCard = ({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <section className="bg-white shadow rounded-lg p-6 space-y-4">
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      {action}
    </div>
    {children}
  </section>
);

export default function AdminAccessPage() {
  const allowedEmails = getWhitelist();
  const { data: session, status, update } = useSession();
  const router = useRouter();

  // use top-level `session.user.email` instead of nested `session.user`
  const userEmail = session?.user?.email?.toLowerCase();
  const isAllowed = userEmail && allowedEmails.has(userEmail);

  // Generate company columns with dependencies
  const companyColumns = useMemo(() => getCompanyColumns(session, update, router), [session, update, router]);

  const [lastUpdateCompanies, setLastUpdateCompanies] = useState<string>(FormatRefreshTime(new Date()));
  const { data: companiesResponse, isFetching: companiesLoading, error: companiesError, refetch: refetchCompanies } = useQuery<Company[]>({
    queryKey: ['public-companies'],
    queryFn: () => {
      setLastUpdateCompanies(FormatRefreshTime(new Date()));
      return ListPublicCompanies(session!);
    },
    enabled: !!session?.user?.access_token,
  })

  const companies = useMemo(() => companiesResponse || [], [companiesResponse])

  const [lastUpdateCompanyCategories, setLastUpdateCompanyCategories] = useState<string>(FormatRefreshTime(new Date()));
  const { data: companyCategoriesResponse, isFetching: companyCategoriesLoading, error: companyCategoriesError, refetch: refetchCompanyCategories } = useQuery({
    queryKey: ['public-company-categories'],
    queryFn: () => {
      setLastUpdateCompanyCategories(FormatRefreshTime(new Date()));
      return GetAllCompanyCategories(session!);
    },
    enabled: !!session?.user?.access_token,
  })

  const companyCategories = useMemo(() => companyCategoriesResponse || [], [companyCategoriesResponse])


  const [lastUpdateUsers, setLastUpdateUsers] = useState<string>(FormatRefreshTime(new Date()));
  const { data: usersResponse, isFetching: usersLoading, error: usersError, refetch: refetchUsers } = useQuery({
    queryKey: ['public-users'],
    queryFn: () => {
      setLastUpdateUsers(FormatRefreshTime(new Date()));
      return ListPublicUsers(session!);
    },
    enabled: !!session?.user?.access_token,
  })

  const users = useMemo(() => usersResponse || [], [usersResponse])

  const [lastUpdateSponsors, setLastUpdateSponsors] = useState<string>(FormatRefreshTime(new Date()));
  const { data: sponsorsResponse, isFetching: sponsorsLoading, error: sponsorsError, refetch: refetchSponsors } = useQuery({
    queryKey: ['public-sponsors'],
    queryFn: () => {
      setLastUpdateSponsors(FormatRefreshTime(new Date()));
      return GetAllSponsors(session!);
    },
    enabled: !!session?.user?.access_token,
  })

  const sponsors = useMemo(() => sponsorsResponse || [], [sponsorsResponse])

  const [lastUpdateAdvertisements, setLastUpdateAdvertisements] = useState<string>(FormatRefreshTime(new Date()));
  const { data: adsResponse, isFetching: adsLoading, error: adsError, refetch: refetchAds } = useQuery({
    queryKey: ['public-advertisements'],
    queryFn: () => {
      setLastUpdateAdvertisements(FormatRefreshTime(new Date()));
      return GetAllAdvertisements(session!);
    },
    enabled: !!session?.user?.access_token,
  })

  const advertisements = useMemo(() => adsResponse || [], [adsResponse])

  const backButton = (
    <Link
      href="/access/company-selection"
      className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all duration-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
    >
      Voltar para seleção
    </Link>
  );

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <Loading />
        {backButton}
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <p className="text-lg text-gray-700 text-center">
          Você precisa estar autenticado para acessar esta página.
        </p>
        {backButton}
      </div>
    );
  }

  if (allowedEmails.size === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 px-6 text-center">
        <h1 className="text-2xl font-semibold">WHITE_LIST não configurada</h1>
        <p className="text-gray-600 max-w-2xl">
          Adicione a variável de ambiente <code className="bg-gray-100 px-1 rounded">WHITE_LIST</code>{" "}
          com os e-mails autorizados (separados por vírgula) antes de liberar o acesso.
        </p>
        {backButton}
      </div>
    );
  }

  if (!isAllowed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3 px-6 text-center">
        <h1 className="text-2xl font-semibold">Acesso restrito</h1>
        <p className="text-gray-600 max-w-xl">
          O e-mail <strong>{session.user?.email ?? "sem e-mail"}</strong> não está presente na
          lista de autorização configurada em <code className="bg-gray-100 px-1 rounded">WHITE_LIST</code>.
        </p>
        {backButton}
      </div>
    );
  }

  return (
    <ModalProvider>
      <div className="space-y-8 p-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-wide text-yellow-600">Acesso Administrativo</p>
            <h1 className="text-3xl font-bold text-gray-900">APIs públicas monitoradas</h1>
            <p className="text-gray-600 max-w-3xl">
              Visualize rapidamente os metadados expostos pelos endpoints <code className="bg-gray-100 px-1 rounded">/public/companies</code>{" "}
              e <code className="bg-gray-100 px-1 rounded">/public/users</code>. Os dados são apenas para leitura.
            </p>
          </div>
          {backButton}
        </header>

        <SectionCard
          title="Empresas públicas"
          description="Resultado direto do endpoint /public/companies"
          action={
            <Refresh
              onRefresh={refetchCompanies}
              isFetching={companiesLoading}
              lastUpdate={lastUpdateCompanies}
            />
          }
        >
          {companiesLoading ? (
            <div className="flex justify-center py-6">
              <Loading />
            </div>
          ) : companiesError ? (
            <p className="text-sm text-red-600">{companiesError.message}</p>
          ) : (
            <CrudLayout
              title="Empresas"
              tableChildren={<CrudTable columns={companyColumns} data={companies} />}
            />
          )}
        </SectionCard>

        <SectionCard
          title="Categorias de Empresa"
          description="Gerencie as categorias de empresa disponíveis no sistema"
          action={
            <div className="flex gap-2">
              <Refresh
                onRefresh={refetchCompanyCategories}
                isFetching={companyCategoriesLoading}
                lastUpdate={lastUpdateCompanyCategories}
              />
            </div>
          }
        >
          {companyCategoriesLoading ? (
            <div className="flex justify-center py-6">
              <Loading />
            </div>
          ) : companyCategoriesError ? (
            <p className="text-sm text-red-600">{(companyCategoriesError as Error).message || "Erro ao carregar categorias"}</p>
          ) : (
            <CrudLayout
              title="Categorias"
              tableChildren={<CrudTable columns={CompanyCategoryColumns()} data={companyCategories} />}
            />
          )}

          <div className="flex justify-end">
            <ButtonIconText
              title="Nova Categoria"
              modalName="new-company-category"
              icon={FaPlus}
            >
              <CompanyCategoryForm />
            </ButtonIconText>
          </div>
        </SectionCard>

        <SectionCard
          title="Patrocinadores"
          description="Gerencie os patrocinadores do sistema"
          action={
            <div className="flex gap-2">
              <Refresh
                onRefresh={refetchSponsors}
                isFetching={sponsorsLoading}
                lastUpdate={lastUpdateSponsors}
              />
            </div>
          }
        >
          {sponsorsLoading ? (
            <div className="flex justify-center py-6">
              <Loading />
            </div>
          ) : sponsorsError ? (
            <p className="text-sm text-red-600">{(sponsorsError as Error).message || "Erro ao carregar patrocinadores"}</p>
          ) : (
            <CrudLayout
              title="Patrocinadores"
              tableChildren={<CrudTable columns={SponsorColumns()} data={sponsors} />}
            />
          )}

          <div className="flex justify-end">
            <ButtonIconText
              title="Novo Patrocinador"
              modalName="new-sponsor"
              icon={FaPlus}
            >
              <SponsorForm />
            </ButtonIconText>
          </div>
        </SectionCard>

        <SectionCard
          title="Propagandas"
          description="Gerencie as propagandas e anúncios"
          action={
            <div className="flex gap-2">
              <Refresh
                onRefresh={refetchAds}
                isFetching={adsLoading}
                lastUpdate={lastUpdateAdvertisements}
              />
            </div>
          }
        >
          {adsLoading ? (
            <div className="flex justify-center py-6">
              <Loading />
            </div>
          ) : adsError ? (
            <p className="text-sm text-red-600">{(adsError as Error).message || "Erro ao carregar propagandas"}</p>
          ) : (
            <CrudLayout
              title="Propagandas"
              tableChildren={<CrudTable columns={AdvertisingColumns()} data={advertisements} />}
            />
          )}

          <div className="flex justify-end">
            <ButtonIconText
              title="Nova Propaganda"
              modalName="new-advertising"
              icon={FaPlus}
            >
              <AdvertisingForm />
            </ButtonIconText>
          </div>
        </SectionCard>

        <SectionCard
          title="Usuários públicos"
          description="Resultado direto do endpoint /public/users"
          action={
            <Refresh
              onRefresh={refetchUsers}
              isFetching={usersLoading}
              lastUpdate={lastUpdateUsers}
            />
          }
        >
          {usersLoading ? (
            <div className="flex justify-center py-6">
              <Loading />
            </div>
          ) : usersError ? (
            <p className="text-sm text-red-600">{usersError.message}</p>
          ) : (
            <CrudLayout
              title="Usuários"
              tableChildren={<CrudTable columns={userColumns()} data={users} />}
            />
          )}
        </SectionCard>
      </div>
    </ModalProvider>
  );
}
