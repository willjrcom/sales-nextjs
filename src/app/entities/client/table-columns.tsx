import { ColumnDef } from "@tanstack/react-table";
import Client from "./client";
import ButtonEdit from "@/app/components/crud/button-edit";
import PersonColumns from "../person/table-columns";
import ClientForm from "@/app/forms/client/form";
import ModalHandler from "@/app/components/modal/modal";
import UpdateClient from "@/app/api/client/update/route";
import { useClients } from "@/app/context/client/context";


const ClientColumns = (): ColumnDef<Client>[] => [
  ...PersonColumns<Client>(),
  {
    id: 'Editar',
    accessorKey: 'id',
    header: 'Editar',
    cell: ({ row }) => {
      const modalHandler = ModalHandler();

      return (
        <ButtonEdit
          name={row.original.name}
          href={`/client/edit/${row.original.id}`}>
          <ClientForm
            item={row.original}
            onSubmit={UpdateClient}
            handleCloseModal={() => modalHandler.setShowModal(false)}
            context={useClients()}/>
        </ButtonEdit>
      )
    },
  },
];

export default ClientColumns