import { ColumnDef } from "@tanstack/react-table";
import Client from "./client";
import ButtonEdit from "@/app/components/crud/button-edit";
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
        <ButtonEdit modalName={"edit-client" + row.original.id }
          name={row.original.name}>
          <ClientForm
            item={row.original}
            isUpdate={true}/>
        </ButtonEdit>
      )
    },
  },
];

export default ClientColumns