import { ColumnDef } from "@tanstack/react-table";
import Order from "./order";
import Address from "../address/address";
import { FormatRefreshTime } from "@/app/components/crud/refresh";
import { FaClock } from "react-icons/fa";

const DeliveryOrderColumns = (): ColumnDef<Order>[] => [
  {
    id: 'Comanda',
    accessorKey: 'order_number',
    header: 'Comanda',
  },
  {
    id: 'Pronto as',
    accessorKey: 'ready_at',
    header: 'Pronto as',
    accessorFn: row => {
      const readyAt = row.delivery?.ready_at;
      if (!readyAt) return '--:--';

      return FormatRefreshTime(new Date(readyAt));
    },
  },
  {
    id: 'Enviado as',
    accessorKey: 'shipped_at',
    header: 'Enviado as',
    accessorFn: row => {
      const shippedAt = row.delivery?.shipped_at;
      if (!shippedAt) return '--:--';

      return FormatRefreshTime(new Date(shippedAt));
    },
  },
  {
    id: 'Entregue as',
    accessorKey: 'delivered_at',
    header: 'Entregue as',
    accessorFn: row => {
      const deliveredAt = row.delivery?.delivered_at;
      if (!deliveredAt) return '--:--';

      return FormatRefreshTime(new Date(deliveredAt));
    },
  },
  {
    id: 'Cliente',
    accessorKey: 'name',
    header: 'Cliente',
    accessorFn: row => {
      const name = row.delivery?.client?.name
      if (!name) return 'Sem cliente'

      const splitName = name.split(' ');
      if (!splitName) return name.substring(0, 15);

      if (splitName.length > 1) return splitName[0] + ' ' + splitName[splitName.length - 1];
      return splitName[0];
    },
  },
  {
    id: 'Endereço',
    accessorKey: 'address',
    header: 'Endereço',
    accessorFn: row => {
      const address = Object.assign(new Address(), row.delivery?.address);
      if (!address) return 'Sem endereço';

      return address.getSmallAddress();
    },
  },
];

export default DeliveryOrderColumns