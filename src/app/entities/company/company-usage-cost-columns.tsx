import { ColumnDef } from "@tanstack/react-table"
import { formatCurrency } from "@/app/utils/format"
import { safeFormat, getStatusBadge } from "./methods"
import { CompanyUsageCost } from "./company-usage-cost";

export const costColumns = (): ColumnDef<CompanyUsageCost>[] => [
    {
        accessorKey: "created_at",
        header: "Data",
        cell: ({ row }) => safeFormat(row.original.created_at, "dd/MM/yyyy HH:mm"),
    },
    {
        header: "Descrição/Tipo",
        cell: ({ row }) => (
            <div className="flex flex-col" >
                <span>{row.original.description || "Sem descrição"} </span>
                <span className="text-xs text-muted-foreground uppercase" > {row.original.cost_type} </span>
            </div>
        ),
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => getStatusBadge(row.original.status),
    },
    {
        accessorKey: "amount",
        header: "Valor",
        cell: ({ row }) => formatCurrency(parseFloat(row.original.amount)),
    },
];
