import { ColumnDef } from "@tanstack/react-table";
import { Employee } from "./employee";
import ButtonEdit from "@/app/components/crud/button-edit";
import PersonColumns from "../person/table-columns";
import EditEmployeeForm from "@/app/forms/employee/edit";


const EmployeeColumns = (): ColumnDef<Employee>[] => [
  ...PersonColumns<Employee>(),
  {
    id: 'Editar',
    accessorKey: 'id',
    header: 'Editar',
    cell: ({ row }) => (
      <ButtonEdit name={row.original.name} href={`/employee/edit/${row.original.id}`}><EditEmployeeForm /></ButtonEdit>
    ),
  },
];

export default EmployeeColumns