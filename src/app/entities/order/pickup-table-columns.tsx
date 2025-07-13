import { ColumnDef } from "@tanstack/react-table";
import Order from "./order";
import DeliveryPickup from "@/app/api/order-pickup/status/delivery/order-pickup";
import CardOrder from "@/app/components/order/card-order";
import ButtonIcon from "@/app/components/button/button-icon";
import { FaSeedling } from "react-icons/fa";
import { BsSend } from "react-icons/bs";

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
    },
  },
  {
    id: 'Entregar',
    accessorKey: 'delivery',
    cell: ({ row }) => {
      return (
        <ButtonIcon modalName={"show-order-" + row.original.id}
          title={"Ver Pedido"} size="xl" icon={BsSend}>
          <CardOrder key={row.original.id} orderId={row.original.id} />
        </ButtonIcon>
      )
    }
  }
];

export default PickupOrderColumns