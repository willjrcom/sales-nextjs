import { ColumnDef } from "@tanstack/react-table";
import ButtonEdit from "@/app/components/crud/button-edit";
import TableForm from "@/app/forms/table/form";
import Table from "./table";


const TableColumns = (): ColumnDef<Table>[] => [
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
          <TableForm 
            item={row.original}
            isUpdate={true}/>
        </ButtonEdit>
      )
    },
  },
];

export default TableColumns