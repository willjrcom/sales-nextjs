import { ColumnDef } from "@tanstack/react-table";
import Shift from "./shift";
import ButtonIcon from "@/app/components/button/button-icon";
import ShiftDashboard from "@/app/pages/(user)/shift/shift-dashboard";


const ShiftColumns = (): ColumnDef<Shift>[] => [
  {
    id: 'Aberto as',
    accessorKey: 'opened_at',
    header: 'Aberto as',
    accessorFn: row => {
      const date = new Date(row.opened_at)
      return date.toLocaleDateString('pt-BR')
    }
  },
  {
    id: 'Fechado as',
    accessorKey: 'closed_at',
    header: 'Fechado as',
    accessorFn: row => {
      const date = new Date(row.closed_at)
      return date.toLocaleDateString('pt-BR')
    }
  },
  {
    id: 'Ver',
    accessorKey: 'id',
    header: 'Ver',
    cell: ({ row }) => {
      return (
        <ButtonIcon modalName={"show-shift-" + row.original.id}
          title={"Ver dia: " + new Date(row.original.opened_at).toLocaleDateString('pt-BR')}>
          <ShiftDashboard
            shift={row.original} />
        </ButtonIcon>
      )
    },
  },
];

export default ShiftColumns