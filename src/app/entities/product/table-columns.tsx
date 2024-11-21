'use client';

import { ColumnDef } from "@tanstack/react-table";
import Product from "./product";
import ButtonEdit from "@/app/components/crud/button-edit";
import ProductForm from "@/app/forms/product/form";
import UpdateProduct from "@/app/api/product/update/route";
import ModalHandler from "@/app/components/modal/modal";


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
    cell: info => `$${info.getValue()}`, // example of custom cell rendering
  },
  {
    id: 'Custo',
    accessorKey: 'cost',
    header: 'Custo',
    cell: info => `$${info.getValue()}`,
  },
  {
    id: 'Categoria',
    accessorKey: 'category.name', // assuming Category has a 'name' field
    header: 'Categoria',
  },
  {
    id: 'Tamanho',
    accessorKey: 'size.name', // assuming Size has a 'name' field
    header: 'Tamanho',
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
      const modalHandler = ModalHandler();

      return (
        <ButtonEdit 
          name={row.original.name} 
          href={`/product/edit/${row.original.id}`}>
          <ProductForm 
            item={row.original}
            onSubmit={UpdateProduct} 
            handleCloseModal={() => modalHandler.setShowModal(false)}/>
        </ButtonEdit>
      )
    },
  },
];

export default ProductColumns