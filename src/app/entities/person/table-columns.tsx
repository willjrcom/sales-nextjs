import { ColumnDef } from "@tanstack/react-table";
import ButtonEdit from "@/app/components/crud/button-edit";
import EditProductForm from "@/app/forms/product/edit";
import { Person } from "./person";

const PersonColumns = <T,>(): ColumnDef<T>[] => [
  {
    id: 'Nome',
    accessorKey: 'name',
    header: 'Name',
  },
  {
    id: 'E-mail',
    accessorKey: 'email',
    header: 'email',
  },
  {
    id: 'Cpf',
    accessorKey: 'cpf',
    header: 'cpf',
  },
  {
    id: 'Nascimento',
    accessorKey: 'birthday',
    header: 'birthday',
  },
  {
    id: 'Contato',
    accessorKey: 'contact.number',
    header: 'contact',
  },
  {
    id: 'Endereço',
    accessorKey: 'address.street',
    header: 'address',
  },
];

export default PersonColumns