import { ColumnDef } from "@tanstack/react-table";
import Client from "./client";
import ButtonEdit from "@/app/components/crud/button-edit";
import PersonColumns from "../person/table-columns";
import ClientForm from "@/app/forms/client/create";
import ModalHandler from "@/app/components/modal/modal";
import { useRouter } from "next/router";
import UpdateClient from "@/app/api/client/update/route";


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
            reloadData={Redirect} />
        </ButtonEdit>
      )
    },
  },
];

const Redirect = () => {
  const router = useRouter();
  router.reload();
}

export default ClientColumns