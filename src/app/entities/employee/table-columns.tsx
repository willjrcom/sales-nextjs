import { ColumnDef } from "@tanstack/react-table";
import Employee  from "./employee";
import ButtonIcon from "@/app/components/button/button-icon";
import EmployeeForm from "@/app/forms/employee/form";
import Contact from "../contact/contact";
import Address from "../address/address";


const EmployeeColumns = (): ColumnDef<Employee>[] => [
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
    id: 'Endereço',
    header: 'Endereço',
    accessorFn: row => {
      if (row.address as Address) {
        return row.address.street + ", " + row.address.number
      }
    },
  },
  {
    id: 'Editar',
    accessorKey: 'id',
    header: 'Editar',
    cell: ({ row }) => {
      return (
        <ButtonIcon modalName={"edit-employee-" + row.original.id }
          title={"Editar " + row.original.name}>
          <EmployeeForm
            item={row.original}
            isUpdate={true}
            isDisabledPerson />
        </ButtonIcon>
      )
    },
  },
];

export default EmployeeColumns