import { ColumnDef } from "@tanstack/react-table";
import ButtonEdit from "@/app/components/crud/button-edit";
import ProcessRuleForm from "@/app/forms/process-rule/form";
import ProcessRule from "./process-rule";

const ProcessRuleColumns = (): ColumnDef<ProcessRule>[] => [
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
        <ButtonEdit modalName={"edit-process-rule" + row.original.id }
          name={row.original.name} >
          <ProcessRuleForm 
            item={row.original}
            isUpdate={true} />
        </ButtonEdit>
      )
    },
  },
];

export default ProcessRuleColumns