import { ColumnDef } from "@tanstack/react-table";
import ButtonEdit from "@/app/components/crud/button-edit";
import Order from "./order";
import Link from "next/link";
import { FaEdit } from "react-icons/fa";

const OrderColumns = (): ColumnDef<Order>[] => [
  {
    id: 'N° Pedido',
    accessorKey: 'order_number',
    header: 'N° Pedido',
  },
  {
    id: 'Status',
    accessorKey: 'status',
    header: 'Status',
  },
  {
    id: 'Tipo',
    accessorFn: row => {
      if (!!row.pickup) {
        return 'Retirada'
      } else if (!!row.delivery) {
        return 'Entrega'
      } else {
        return 'Mesa'
      }
    },
    header: 'Tipo',
  },
  {
    id: 'Editar',
    accessorKey: 'id',
    header: 'Editar',
    cell: ({ row }) => {
      return (
        <Link href={'/pages/order/' + row.original.id} className="flex items-center space-x-2 p-2 rounded-md w-max">
            <FaEdit />
        </Link>
      )
    },
  },
];

export default OrderColumns