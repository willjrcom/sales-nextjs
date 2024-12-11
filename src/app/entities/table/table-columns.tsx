import { ColumnDef } from "@tanstack/react-table";
import ButtonIcon from "@/app/components/button/button-icon";
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
        <ButtonIcon modalName={"edit-table-" + row.original.id }
          title={"Editar " + row.original.name}>
          <TableForm 
            item={row.original}
            isUpdate={true}/>
        </ButtonIcon>
      )
    },
  },
];

export default TableColumns