import { ColumnDef } from "@tanstack/react-table";
import Client from "./client";
import ButtonIcon from "@/app/components/button/button-icon";
import PersonColumns from "../person/table-columns";
import ClientForm from "@/app/forms/client/form";


const ClientColumns = (): ColumnDef<Client>[] => [
  ...PersonColumns<Client>(),
  {
    id: 'Editar',
    accessorKey: 'id',
    header: 'Editar',
    cell: ({ row }) => {
      return (
        <ButtonIcon modalName={"edit-client-" + row.original.id }
          title={"Editar " + row.original.name}>
          <ClientForm
            item={row.original}
            isUpdate={true}/>
        </ButtonIcon>
      )
    },
  },
];

export default ClientColumns