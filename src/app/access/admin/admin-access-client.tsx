'use client';

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { ColumnDef } from "@tanstack/react-table";
import CrudLayout from "@/app/components/crud/crud-layout";
import CrudTable from "@/app/components/crud/table";
import Loading from "@/app/components/loading/Loading";
import Company from "@/app/entities/company/company";
import User from "@/app/entities/user/user";
import ListPublicCompanies from "@/app/api/public/companies";
import ListPublicUsers from "@/app/api/public/users";
import { notifyError } from "@/app/utils/notifications";
import Link from "next/link";

interface AdminAccessClientProps {
  whitelist: string;
}

const parseWhitelist = (value: string): Set<string> => {
  if (!value) {
    return new Set();
  }

  return new Set(
    value
      .split(/[\n,;]/)
      .map((entry) => entry.trim().toLowerCase())
      .filter(Boolean)
  );
};

const companyColumns: ColumnDef<Company>[] = [
  {
    accessorKey: "trade_name",
    header: "Nome Fantasia",
  },
  {
    accessorKey: "business_name",
    header: "Razão Social",
  },
  {
    accessorKey: "schema_name",
    header: "Schema",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
];

const userColumns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: "Nome",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    id: "companies_count",
    header: "Empresas Vinculadas",
    accessorFn: (row) => row.companies?.length ?? 0,
  },
];

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

export default function AdminAccessClient({ whitelist }: AdminAccessClientProps) {
  const allowedEmails = useMemo(() => parseWhitelist(whitelist), [whitelist]);
  const { data: session, status } = useSession();

  const userEmail = session?.user?.user?.email?.toLowerCase();
  const isAllowed =
    !!userEmail && (allowedEmails.size === 0 ? false : allowedEmails.has(userEmail));

  const [companies, setCompanies] = useState<Company[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [companiesLoading, setCompaniesLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [companiesError, setCompaniesError] = useState<string | null>(null);
  const [usersError, setUsersError] = useState<string | null>(null);

  const backButton = (
    <Link
      href="/access/company-selection"
      className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all duration-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
    >
      Voltar para seleção
    </Link>
  );

  const loadCompanies = useCallback(async () => {
    if (!session) return;
    setCompaniesLoading(true);
    setCompaniesError(null);
    try {
      const response = await ListPublicCompanies(session);
      setCompanies(response);
    } catch (error) {
      console.error(error);
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível carregar as empresas públicas.";
      setCompaniesError(message);
      notifyError(message);
    } finally {
      setCompaniesLoading(false);
    }
  }, [session]);

  const loadUsers = useCallback(async () => {
    if (!session) return;
    setUsersLoading(true);
    setUsersError(null);
    try {
      const response = await ListPublicUsers(session);
      setUsers(response);
    } catch (error) {
      console.error(error);
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível carregar os usuários públicos.";
      setUsersError(message);
      notifyError(message);
    } finally {
      setUsersLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (!session || !isAllowed) {
      return;
    }
    loadCompanies();
    loadUsers();
  }, [session, isAllowed, loadCompanies, loadUsers]);

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
          O e-mail <strong>{session.user.user?.email ?? "sem e-mail"}</strong> não está presente na
          lista de autorização configurada em <code className="bg-gray-100 px-1 rounded">WHITE_LIST</code>.
        </p>
        {backButton}
      </div>
    );
  }

  return (
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
          <button
            onClick={loadCompanies}
            disabled={companiesLoading}
            className="px-4 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-60"
          >
            {companiesLoading ? "Atualizando..." : "Atualizar"}
          </button>
        }
      >
        {companiesLoading ? (
          <div className="flex justify-center py-6">
            <Loading />
          </div>
        ) : companiesError ? (
          <p className="text-sm text-red-600">{companiesError}</p>
        ) : (
          <CrudLayout
            title="Empresas"
            tableChildren={<CrudTable columns={companyColumns} data={companies} />}
          />
        )}
      </SectionCard>

      <SectionCard
        title="Usuários públicos"
        description="Resultado direto do endpoint /public/users"
        action={
          <button
            onClick={loadUsers}
            disabled={usersLoading}
            className="px-4 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-60"
          >
            {usersLoading ? "Atualizando..." : "Atualizar"}
          </button>
        }
      >
        {usersLoading ? (
          <div className="flex justify-center py-6">
            <Loading />
          </div>
        ) : usersError ? (
          <p className="text-sm text-red-600">{usersError}</p>
        ) : (
          <CrudLayout
            title="Usuários"
            tableChildren={<CrudTable columns={userColumns} data={users} />}
          />
        )}
      </SectionCard>
    </div>
  );
}
