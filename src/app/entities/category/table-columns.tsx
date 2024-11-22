import { ColumnDef } from "@tanstack/react-table";
import ButtonEdit from "@/app/components/crud/button-edit";
import CategoryForm from "@/app/forms/category/form";
import Category from "./category";

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
        <ButtonEdit 
          name={row.original.name}>
          <CategoryForm 
            item={row.original}/>
        </ButtonEdit>
      )
    },
  },
];

export default CategoryColumns