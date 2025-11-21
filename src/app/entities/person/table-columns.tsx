import { ColumnDef } from "@tanstack/react-table";
import Person from "./person";
import Contact from "../contact/contact";
import Address from "../address/address";

const PersonColumns = <T extends Person,>(): ColumnDef<T>[] => [
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
    id: 'CPF',
    accessorKey: 'cpf',
    header: 'CPF',
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
];

export default PersonColumns