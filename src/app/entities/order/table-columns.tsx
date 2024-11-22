import { ColumnDef } from "@tanstack/react-table";
import ButtonEdit from "@/app/components/crud/button-edit";
import Order from "./order";

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
        <ButtonEdit 
          name={String(row.original.order_number)}>
            <h1>order</h1>
          {/* <OrderForm 
            item={row.original}
            isUpdate={true}/> */}
        </ButtonEdit>
      )
    },
  },
];

export default OrderColumns