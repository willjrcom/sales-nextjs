import { ColumnDef } from "@tanstack/react-table";
import Category from "./category";
import Link from "next/link";
import { FaEdit } from "react-icons/fa";

const CategoryColumns = (): ColumnDef<Category>[] => [
  {
    id: 'Nome',
    accessorKey: 'name',
    header: 'Nome',
  },
  {
    id: 'Imagem',
    accessorKey: 'image_path',
    header: 'Imagem',
  },
  {
    id: 'Editar',
    accessorKey: 'id',
    header: 'Editar',
    cell: ({ row }) => {
      return (
        <Link href={'/pages/product/category/' + row.original.id} className="flex items-center space-x-2 p-2 rounded-md w-max">
            <FaEdit />
        </Link>
      )
    },
  },
];

export default CategoryColumns