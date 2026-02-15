import User from "@/app/entities/user/user";
import { ColumnDef } from "@tanstack/react-table";

export const userColumns: ColumnDef<User>[] = [
    {
        accessorKey: "name",
        header: "Nome",
    },
    {
        accessorKey: "email",
        header: "Email",
    },
    {
        accessorKey: "contact",
        header: "Contato",
        cell: ({ row }) => {
            const contact = row.original.contact;
            if (!contact) {
                return <span className="text-gray-400">Sem contato</span>;
            }

            // Format phone number as (xx) xxxxx-xxxx
            const formatPhone = (phone: string) => {
                const digits = phone.replace(/\D/g, '');
                if (digits.length === 11) {
                    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
                }
                if (digits.length === 10) {
                    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
                }
                return phone; // Return original if doesn't match expected length
            };

            return formatPhone(contact.number);
        },
    },
    {
        id: "companies_names",
        header: "Empresas Vinculadas",
        cell: ({ row }) => {
            const companies = row.original.companies ?? [];
            if (companies.length === 0) {
                return <span className="text-gray-400" > Sem empresas </span>;
            }
            return (
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700" >
                    {
                        companies.map((company) => (
                            <li key={company.id || company.schema_name} >
                                {company.trade_name || company.business_name || company.schema_name}
                            </li>
                        ))
                    }
                </ul>
            );
        },
    },
];