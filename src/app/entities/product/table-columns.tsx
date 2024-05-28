import { ColumnDef } from "@tanstack/react-table";
import { Product } from "./product";
import ButtonEdit from "@/app/components/crud/button-edit";
import EditEmployeeForm from "@/app/forms/employee/edit";


const ProductColumns = (): ColumnDef<Product>[] => [
  {
    id: 'Código',
    accessorKey: 'code',
    header: 'Code',
  },
  {
    id: 'Nome',
    accessorKey: 'name',
    header: 'Name',
  },
  {
    id: 'Descrição',
    accessorKey: 'description',
    header: 'Description',
    maxSize: 10
  },
  {
    id: 'Preço',
    accessorKey: 'price',
    header: 'Price',
    cell: info => `$${info.getValue()}`, // example of custom cell rendering
  },
  {
    id: 'Custo',
    accessorKey: 'cost',
    header: 'Cost',
    cell: info => `$${info.getValue()}`,
  },
  {
    id: 'Categoria',
    accessorKey: 'category.name', // assuming Category has a 'name' field
    header: 'Category',
  },
  {
    id: 'Tamanho',
    accessorKey: 'size.name', // assuming Size has a 'name' field
    header: 'Size',
  },
  {
    id: 'Disponível?',
    accessorKey: 'is_available',
    header: 'Available',
    cell: info => (info.getValue() ? 'Sim' : 'Não'),
  },
  {
    id: 'Editar',
    accessorKey: 'id',
    header: 'ID',
    cell: ({ row }) => (
      <ButtonEdit name={row.original.name} href={`/employee/edit/${row.original.id}`}><EditEmployeeForm /></ButtonEdit>
    ),
  },
];

export default ProductColumns