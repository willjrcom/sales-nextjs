import { ColumnDef } from "@tanstack/react-table";
import { Address } from "./address";
import ButtonEdit from "@/app/components/crud/button-edit";
import EditAddressForm from "@/app/forms/address/edit";

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
    accessorKey: 'state',
    header: 'state',
  },
  {
    id: 'Cep',
    accessorKey: 'cep',
    header: 'cep',
  },
  {
    id: 'Editar',
    accessorKey: 'id',
    header: 'ID',
    cell: ({ row }) => (
      <ButtonEdit name={row.original.street} href={`/address/edit/${row.original.id}`}><EditAddressForm /></ButtonEdit>
    ),
  },
];

export default AddressColumns