import { ColumnDef } from "@tanstack/react-table";
import Employee  from "./employee";
import ButtonIcon from "@/app/components/button/button-icon";
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
        <ButtonIcon modalName={"edit-employee-" + row.original.id }
          title={"Editar " + row.original.name}>
          <EmployeeForm
            item={row.original}
            isUpdate={true}/>
        </ButtonIcon>
      )
    },
  },
];

export default EmployeeColumns