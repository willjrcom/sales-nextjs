import { ColumnDef } from "@tanstack/react-table";
import ButtonIcon from "@/app/components/button/button-icon";
import DeliveryDriver from "./delivery-driver";
import DeliveryDriverForm from "@/app/forms/delivery-driver/form";


const DeliveryDriverColumns = (): ColumnDef<DeliveryDriver>[] => [
  {
    id: 'Nome',
    accessorKey: 'name',
    header: 'Nome',
    accessorFn: row => {
      return row.employee.name
    }
  },
  {
    id: 'Entregas',
    accessorKey: 'order_deliveries',
    header: 'Entregas',
    accessorFn: row => {
      return row.order_deliveries?.length || 0
    }
  },
  {
    id: 'Editar',
    accessorKey: 'id',
    header: 'Editar',
    cell: ({ row }) => {
      return (
        <ButtonIcon modalName={"edit-delivery-driver-" + row.original.id }
          title={"Editar " + row.original.employee.name}>
          <DeliveryDriverForm
            item={row.original}
            isUpdate={true}/>
        </ButtonIcon>
      )
    },
  },
];

export default DeliveryDriverColumns