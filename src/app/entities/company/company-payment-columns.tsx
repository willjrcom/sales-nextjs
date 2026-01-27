import { ColumnDef } from "@tanstack/react-table";
import { CompanyPayment } from "./company-payment";
import { formatCurrency } from "@/app/utils/format";
import { safeFormat, getStatusBadge } from "./methods";
import { Button } from "@/components/ui/button";

export const paymentColumns = (handleCancel: (id: string) => void): ColumnDef<CompanyPayment>[] => [
    {
        accessorKey: "created_at",
        header: "Data",
        cell: ({ row }) => safeFormat(row.original.created_at, "dd/MM/yyyy HH:mm"),
    },
    {
        accessorKey: "amount",
        header: "Valor",
        cell: ({ row }) => formatCurrency(parseFloat(row.original.amount)),
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => getStatusBadge(row.original.status),
    },
    {
        header: "Período",
        cell: ({ row }) => row.original.months > 0 ? `${row.original.months} meses` : "Avulso",
    },
    {
        accessorKey: "external_reference",
        header: "Ref.",
        cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.original.external_reference?.substring(0, 8)}...</span>,
    },
    {
        id: "actions",
        header: "Ações",
        cell: ({ row }) => {
            const payment = row.original;
            return (
                <div className="flex gap-2" >
                    {
                        payment.status === "pending" && payment.payment_url && (
                            <Button variant="link" size="sm" asChild className="h-auto p-0 text-blue-600" >
                                <a href={payment.payment_url} target="_blank" rel="noopener noreferrer" >
                                    Pagar
                                </a>
                            </Button>
                        )
                    }
                    {
                        payment.status === "pending" && (
                            <Button
                                variant="link"
                                size="sm"
                                className="h-auto p-0 text-red-600 ml-2"
                                onClick={() => handleCancel(payment.id)
                                }
                            >
                                Cancelar
                            </Button>
                        )
                    }
                </div>
            );
        },
    },
];
