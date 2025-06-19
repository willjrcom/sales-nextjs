import { ColumnDef } from "@tanstack/react-table";
import ButtonIcon from "@/app/components/button/button-icon";
import ProcessRuleForm from "@/app/forms/process-rule/form";
import ProcessRule from "./process-rule";
import { FaClock } from "react-icons/fa";

const ProcessRuleColumns = (): ColumnDef<ProcessRule>[] => [
  {
    id: 'Ordem',
    accessorKey: 'order',
    header: 'Ordem',
  },
  {
    id: 'Nome',
    accessorKey: 'name',
    header: 'Nome',
  },
  {
    id: 'Tempo ideal',
    accessorKey: 'ideal_time',
    header: 'Tempo ideal',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <FaClock className="text-gray-500" />
        <span>{row.original.ideal_time}</span>
      </div>
    ),
  },
  {
    id: 'Editar',
    accessorKey: 'id',
    header: 'Editar',
    cell: ({ row }) => {
      return (
        <ButtonIcon modalName={"edit-process-rule-" + row.original.id}
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