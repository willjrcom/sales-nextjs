import { ColumnDef } from "@tanstack/react-table";
import User  from "./user";
import ButtonIcon from "@/app/components/button/button-icon";
import UserForm from "@/app/forms/user/form-profile";
import Contact from "../contact/contact";
import UserFormRelation from "@/app/forms/user/form-relation";


const UserColumns = (): ColumnDef<User>[] => [
  {
    id: 'Nome',
    accessorKey: 'name',
    header: 'Nome',
  },
  {
    id: 'Contato',
    header: 'Contato',
    accessorFn: row => {
      if (row.contact as Contact) {
        const contact = row.contact as Contact
        if (contact.ddd || contact.number) {
          return "(" + contact.ddd + ") " + contact.number
        }
        return contact.ddd + " " + contact.number
      }
    },
  },
  {
    id: 'Cpf',
    accessorKey: 'cpf',
    header: 'Cpf',
  },
  {
    id: 'Email',
    accessorKey: 'email',
    header: 'Email',
  },
  {
    id: 'Editar',
    accessorKey: 'id',
    header: 'Editar',
    cell: ({ row }) => {
      return (
        <ButtonIcon modalName={"edit-user-" + row.original.id }
          title={"Editar " + row.original.name}>
          <UserFormRelation
            item={row.original}
            isUpdate={true} />
        </ButtonIcon>
      )
    },
  },
];

export default UserColumns