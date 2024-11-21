import { ColumnDef } from "@tanstack/react-table";
import ButtonEdit from "@/app/components/crud/button-edit";
import ProcessRuleForm from "@/app/forms/process-rule/form";
import UpdateProcessRule from "@/app/api/process-rule/update/route";
import ModalHandler from "@/app/components/modal/modal";
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
      const modalHandler = ModalHandler();

      return (
        <ButtonEdit 
          name={row.original.name} >
          <ProcessRuleForm 
            item={row.original}
            onSubmit={UpdateProcessRule} 
            handleCloseModal={() => modalHandler.setShowModal(false)}/>
        </ButtonEdit>
      )
    },
  },
];

export default ProcessRuleColumns