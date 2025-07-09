import { ColumnDef } from "@tanstack/react-table";
import Order from "./order";

const PickupOrderColumns = (): ColumnDef<Order>[] => [
  {
    id: 'Comanda',
    accessorKey: 'order_number',
    header: 'Comanda',
  },
  {
    id: 'Nome',
    accessorKey: 'name',
    header: 'Nome',
    accessorFn: row => {
      const name = row.pickup?.name
      if (!name) return 'Sem cliente'

      return name.substring(0, 15);
    }
  },
];

export default PickupOrderColumns