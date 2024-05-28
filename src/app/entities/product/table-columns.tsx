import { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import { Product } from "./product";


const ProductColumns = (): ColumnDef<Product>[] => [
  {
    id: 'id',
    accessorKey: 'id',
    header: 'ID',
  },
  {
    id: 'code',
    accessorKey: 'code',
    header: 'Code',
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: 'Name',
  },
  {
    id: 'description',
    accessorKey: 'description',
    header: 'Description',
  },
  {
    id: 'price',
    accessorKey: 'price',
    header: 'Price',
    cell: info => `$${info.getValue()}`, // example of custom cell rendering
  },
  {
    id: 'cost',
    accessorKey: 'cost',
    header: 'Cost',
    cell: info => `$${info.getValue()}`,
  },
  {
    id: 'category',
    accessorKey: 'category.name', // assuming Category has a 'name' field
    header: 'Category',
  },
  {
    id: 'size',
    accessorKey: 'size.name', // assuming Size has a 'name' field
    header: 'Size',
  },
  {
    id: 'is_available',
    accessorKey: 'is_available',
    header: 'Available',
    cell: info => (info.getValue() ? 'Yes' : 'No'),
  },
];

export default ProductColumns