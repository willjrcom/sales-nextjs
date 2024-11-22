import { ColumnDef } from "@tanstack/react-table";
import ButtonEdit from "@/app/components/crud/button-edit";
import ProcessRuleForm from "@/app/forms/process-rule/form";
import UpdateProcessRule from "@/app/api/process-rule/update/route";
import ModalHandler from "@/app/components/modal/modal";
import ProcessRule from "./process-rule";
import { useProcessRules } from "@/app/context/process-rule/context";

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
        <ButtonEdit 
          name={row.original.name} >
          <ProcessRuleForm 
            item={row.original}
            onSubmit={UpdateProcessRule} />
        </ButtonEdit>
      )
    },
  },
];

export default ProcessRuleColumns