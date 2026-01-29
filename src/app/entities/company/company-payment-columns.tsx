import { ColumnDef } from "@tanstack/react-table";
import { CompanyPayment } from "./company-payment";
import { formatCurrency } from "@/app/utils/format";
import { safeFormat, getStatusBadge } from "./methods";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const paymentColumns = (handleCancel: (id: string) => void): ColumnDef<CompanyPayment>[] => [
    {
        accessorKey: "created_at",
        header: "Data",
        cell: ({ row }) => safeFormat(row.original.created_at, "dd/MM/yyyy HH:mm"),
    },
    {
        accessorKey: "expires_at",
        header: "Vencimento",
        cell: ({ row }) => {
            if (row.original.expires_at) {
                return safeFormat(row.original.expires_at, "dd/MM/yyyy");
            }
            return "-";
        },
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
        header: "Plano",
        cell: ({ row }) => {
            if (!row.original.plan_type) return "-";
            const planLabels: Record<string, string> = {
                "basic": "Básico",
                "intermediate": "Intermediário",
                "advanced": "Avançado",
            };
            const normalizedType = row.original.plan_type.toLowerCase();
            return planLabels[normalizedType] || row.original.plan_type;
        },
    },
    {
        accessorKey: "is_mandatory",
        header: "Obrigatório",
        cell: ({ row }) => (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${row.original.is_mandatory ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                {row.original.is_mandatory ? "Sim" : "Opcional"}
            </span>
        ),
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
                        payment.status === "pending" && !payment.is_mandatory && (
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        variant="link"
                                        size="sm"
                                        className="h-auto p-0 text-red-600 ml-2"
                                    >
                                        Cancelar
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Cancelar Pagamento</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Tem certeza que deseja cancelar este pagamento? Esta ação não pode ser desfeita.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Voltar</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleCancel(payment.id)} className="bg-red-600 hover:bg-red-700">
                                            Confirmar Cancelamento
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )
                    }
                </div>
            );
        },
    },
];
