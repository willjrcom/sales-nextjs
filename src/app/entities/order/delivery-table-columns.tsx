import { ColumnDef } from "@tanstack/react-table";
import Order from "./order";
import Link from "next/link";
import { FaEdit } from "react-icons/fa";
import Address from "../address/address";

const DeliveryOrderColumns = (): ColumnDef<Order>[] => [
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