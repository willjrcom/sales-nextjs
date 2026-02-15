import Access from "@/app/api/auth/access/access";
import { Button } from "@/components/ui/button";
import Company from "@/app/entities/company/company";
import RequestError from "@/app/utils/error";
import { notifyError } from "@/app/utils/notifications";
import { ColumnDef } from "@tanstack/react-table";
import { Session } from "next-auth";
import { useRouter } from "next/navigation";

export const getCompanyColumns = (
    data: Session | null,
    update: (data?: any) => Promise<Session | null>,
    router: ReturnType<typeof useRouter>
): ColumnDef<Company>[] => [
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
            id: "categories",
            header: "Categorias",
            accessorFn: (row) => row.categories?.map(c => c.name).join(", ") || "",
        },
        {
            accessorKey: "email",
            header: "Email",
        },
        {
            id: "acessar",
            header: "Acessar",
            cell: ({ row }) => {
                const company = row.original;

                const submit = async () => {
                    if (!data) {
                        notifyError('Sessão inválida');
                        return;
                    }

                    try {
                        const response = await Access({ schema: company.schema_name }, data);

                        await update({
                            ...data,
                            user: {
                                access_token: response,
                            },
                        });

                        data.user.access_token = response;
                        router.push('/pages/new-order');
                    } catch (error) {
                        const err = error as RequestError;
                        notifyError(err.message || 'Ocorreu um erro ao selecionar a empresa');
                    }
                };

                return (
                    <Button
                        onClick={submit}
                        variant="outline"
                        className="h-8 px-3 text-sm"
                    >
                        Acessar
                    </Button>
                );
            },
        },
    ];