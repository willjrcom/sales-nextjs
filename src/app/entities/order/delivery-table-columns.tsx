import { ColumnDef } from "@tanstack/react-table";
import Order from "./order";
import Link from "next/link";
import { FaEdit } from "react-icons/fa";
import { showStatus } from "@/app/utils/status";
import OrderDelivery from "./order-delivery";

const DeliveryOrderColumns = (): ColumnDef<OrderDelivery>[] => [
  {
    id: 'Cliente',
    accessorKey: 'name',
    header: 'Cliente',
    accessorFn: row => row.client?.name || 'Sem cliente',
  },
  {
    id: 'Status',
    accessorKey: 'status',
    header: 'Status',
    accessorFn: row => showStatus[row.status],
  },
 {
  id: 'Endereço',
  accessorKey: 'address',
  header: 'Endereço',
  accessorFn: row => row.address?.street || 'Sem endereço',
 },
  {
    id: 'Editar',
    accessorKey: 'id',
    header: 'Editar',
    cell: ({ row }) => {
      return (
        <Link href={'/pages/order-control/' + row.original.id} className="flex items-center space-x-2 p-2 rounded-md w-max">
            <FaEdit />
        </Link>
      )
    },
  },
];

export default DeliveryOrderColumns