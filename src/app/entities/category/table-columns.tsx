import { ColumnDef } from "@tanstack/react-table";
import ButtonEdit from "@/app/components/crud/button-edit";
import CategoryForm from "@/app/forms/category/form";
import UpdateCategory from "@/app/api/category/update/route";
import ModalHandler from "@/app/components/modal/modal";
import { useCategories } from "@/app/context/category/context";
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
      const modalHandler = ModalHandler();

      return (
        <ButtonEdit 
          name={row.original.name}>
          <CategoryForm 
            item={row.original}
            onSubmit={UpdateCategory} 
            handleCloseModal={() => modalHandler.setShowModal(false)}
            context={useCategories()}/>
        </ButtonEdit>
      )
    },
  },
  {
    id: 'Processos',
    accessorKey: 'process_rules',
    header: 'Processos',
    cell: ({row}) => {
      return (
        <Link href={`/pages/process-rule/${row.original.id}`}>
          <button className="flex items-center space-x-2 p-2 rounded-md w-max">
              <FaEdit />
          </button>
        </Link>
      )
    }
  }
];

export default CategoryColumns