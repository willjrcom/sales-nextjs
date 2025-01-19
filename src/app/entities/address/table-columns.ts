import { ColumnDef } from "@tanstack/react-table";
import Address from "./address";

const AddressColumns = (): ColumnDef<Address>[] => [
  {
    id: 'Rua',
    accessorKey: 'street',
    header: 'street',
  },
  {
    id: 'Número',
    accessorKey: 'number',
    header: 'number',
  },
  {
    id: 'Complement',
    accessorKey: 'complement',
    header: 'complement',
    maxSize: 10
  },
  {
    id: 'Referencia',
    accessorKey: 'reference',
    header: 'reference',
  },
  {
    id: 'Bairro',
    accessorKey: 'neighborhood',
    header: 'neighborhood',
  },
  {
    id: 'Cidade',
    accessorKey: 'city',
    header: 'city',
  },
  {
    id: 'Estado',
    accessorKey: 'uf',
    header: 'uf',
  },
  {
    id: 'Cep',
    accessorKey: 'cep',
    header: 'cep',
  },
];

export default AddressColumns