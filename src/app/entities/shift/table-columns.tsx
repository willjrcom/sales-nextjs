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
      return date.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
    }
  },
  {
    id: 'Fechado as',
    accessorKey: 'closed_at',
    header: 'Fechado as',
    accessorFn: row => {
      if (!row.closed_at) return 'Em aberto'
      const date = new Date(row.closed_at)
      return date.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
    }
  },
  {
    id: 'Ver',
    accessorKey: 'id',
    header: 'Ver',
    cell: ({ row }) => {
      const shiftInstance = Object.assign(new Shift(), row.original);
      return (
        <ButtonIcon modalName={"show-shift-" + row.original.id} size="xl"
          title={"Ver dia: " + new Date(row.original.opened_at).toLocaleDateString('pt-BR')}>
          <ShiftDashboard
            shift={shiftInstance} 
            isUpdate={true}
            />
        </ButtonIcon>
      )
    },
  },
];

export default ShiftColumns