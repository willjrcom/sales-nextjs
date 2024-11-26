import { ColumnDef } from "@tanstack/react-table";
import Product from "./product";
import ButtonEdit from "@/app/components/crud/button-edit";
import ProductForm from "@/app/forms/product/form";

const ProductColumns = (): ColumnDef<Product>[] => [
  {
    id: 'Código',
    accessorKey: 'code',
    header: 'Código',
  },
  {
    id: 'Nome',
    accessorKey: 'name',
    header: 'Nome',
  },
  {
    id: 'Descrição',
    accessorKey: 'description',
    header: 'Descrição',
    maxSize: 10
  },
  {
    id: 'Preço',
    accessorKey: 'price',
    header: 'Preço',
    cell: info => `R$${info.getValue()}`,
  },
  {
    id: 'Custo',
    accessorKey: 'cost',
    header: 'Custo',
    cell: info => `R$${info.getValue()}`,
  },
  {
    id: 'Categoria',
    accessorKey: 'category.name',
    header: 'Categoria',
    cell: (info) => info.row.original.category?.name || "Sem categoria",
  },
  {
    id: 'Tamanho',
    accessorKey: 'size.name',
    header: 'Tamanho',
    cell: (info) => info.row.original.size?.name || "Sem tamanho",
  },
  {
    id: 'Disponível?',
    accessorKey: 'is_available',
    header: 'Disponível?',
    cell: info => (info.getValue() ? 'Sim' : 'Não'),
  },
  {
    id: 'Editar',
    accessorKey: 'id',
    header: 'Editar',
    cell: ({ row }) => {
      return (
        <ButtonEdit modalName={"edit-product-" + row.original.id }
          name={row.original.name}>
          <ProductForm
            item={row.original} 
            isUpdate={true}/>
        </ButtonEdit>
      )
    },
  },
];

export default ProductColumns