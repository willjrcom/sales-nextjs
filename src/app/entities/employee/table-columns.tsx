import { ColumnDef } from "@tanstack/react-table";
import { Employee } from "./employee";
import ButtonEdit from "@/app/components/crud/button-edit";
import EditProductForm from "@/app/forms/product/edit";
import PersonColumns from "../person/table-columns";


const EmployeeColumns = (): ColumnDef<Employee>[] => [
  ...PersonColumns<Employee>(),
  {
    id: 'Editar',
    accessorKey: 'id',
    header: 'ID',
    cell: ({ row }) => (
      <ButtonEdit name={row.original.name} href={`/product/edit/${row.original.id}`}><EditProductForm /></ButtonEdit>
    ),
  },
];

export default EmployeeColumns