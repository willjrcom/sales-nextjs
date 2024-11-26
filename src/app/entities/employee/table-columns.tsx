import { ColumnDef } from "@tanstack/react-table";
import Employee  from "./employee";
import ButtonEdit from "@/app/components/crud/button-edit";
import PersonColumns from "../person/table-columns";
import EmployeeForm from "@/app/forms/employee/form";


const EmployeeColumns = (): ColumnDef<Employee>[] => [
  ...PersonColumns<Employee>(),
  {
    id: 'Editar',
    accessorKey: 'id',
    header: 'Editar',
    cell: ({ row }) => {
      return (
        <ButtonEdit modalName={"edit-employee" + row.original.id }
          name={row.original.name}>
          <EmployeeForm
            item={row.original}
            isUpdate={true}/>
        </ButtonEdit>
      )
    },
  },
];

export default EmployeeColumns