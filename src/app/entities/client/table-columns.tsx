import { ColumnDef } from "@tanstack/react-table";
import { Client } from "./client";
import ButtonEdit from "@/app/components/crud/button-edit";
import EditClientForm from "@/app/forms/client/edit";
import PersonColumns from "../person/table-columns";


const ClientColumns = (): ColumnDef<Client>[] => [
  ...PersonColumns<Client>(),
  {
    id: 'Editar',
    accessorKey: 'id',
    header: 'ID',
    cell: ({ row }) => (
      <ButtonEdit name={row.original.name} href={`/client/edit/${row.original.id}`}><EditClientForm /></ButtonEdit>
    ),
  },
];

export default ClientColumns