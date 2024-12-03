import { ColumnDef } from "@tanstack/react-table";
import ButtonIcon from "@/app/components/crud/button-icon";
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
        <ButtonIcon modalName={"edit-process-rule" + row.original.id }
        title={"Editar " + row.original.name}>
          <ProcessRuleForm 
            item={row.original}
            isUpdate={true} />
        </ButtonIcon>
      )
    },
  },
];

export default ProcessRuleColumns