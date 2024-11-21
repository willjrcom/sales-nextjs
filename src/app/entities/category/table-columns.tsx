import { ColumnDef } from "@tanstack/react-table";
import ButtonEdit from "@/app/components/crud/button-edit";
import CategoryForm from "@/app/forms/category/form";
import UpdateCategory from "@/app/api/category/update/route";
import ModalHandler from "@/app/components/modal/modal";
import { useCategories } from "@/app/context/category/context";
import Category from "./category";
import PageProcessRules from "@/app/pages/product/process-rule";
import { ProcessRuleProvider } from "@/app/context/process-rule/context";


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
        <ButtonEdit name="Processos">
          <ProcessRuleProvider id={row.original.id}>
            <PageProcessRules id={row.original.id} />
          </ProcessRuleProvider>
        </ButtonEdit>
      )
    }
  }
];

export default CategoryColumns