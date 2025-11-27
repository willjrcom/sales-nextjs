import { ColumnDef } from "@tanstack/react-table";
import CompanyPayment from "./company-payment";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const statusLabels: Record<string, string> = {
  approved: "Aprovado",
  pending: "Pendente",
  in_process: "Em processamento",
  rejected: "Recusado",
  refunded: "Estornado",
  cancelled: "Cancelado",
};

const CompanyPaymentColumns = (): ColumnDef<CompanyPayment>[] => [
  {
    id: "paid_at",
    header: "Pago em",
    accessorKey: "paid_at",
    cell: ({ row }) =>
      row.original.paid_at
        ? new Date(row.original.paid_at).toLocaleString("pt-BR")
        : "-",
  },
  {
    id: "months",
    header: "Meses",
    accessorKey: "months",
  },
  {
    id: "amount",
    header: "Valor",
    accessorKey: "amount",
    cell: ({ row }) => currencyFormatter.format(row.original.amount.toNumber()),
  },
  {
    id: "status",
    header: "Status",
    accessorKey: "status",
    cell: ({ row }) =>
      statusLabels[row.original.status?.toLowerCase()] ?? row.original.status,
  },
  {
    id: "provider",
    header: "Provedor",
    accessorKey: "provider",
  },
  {
    id: "provider_payment_id",
    header: "ID no Provedor",
    accessorKey: "provider_payment_id",
  },
];

export default CompanyPaymentColumns;
