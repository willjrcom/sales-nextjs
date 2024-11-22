import { ColumnDef } from "@tanstack/react-table";
import Employee  from "./employee";
import ButtonEdit from "@/app/components/crud/button-edit";
import PersonColumns from "../person/table-columns";
import ModalHandler from "@/app/components/modal/modal";
import EmployeeForm from "@/app/forms/employee/form";
import UpdateEmployee from "@/app/api/employee/update/route";
import { ItemContextProps } from "@/app/context/props";
import { useEmployees } from "@/app/context/employee/context";


const EmployeeColumns = (): ColumnDef<Employee>[] => [
  ...PersonColumns<Employee>(),
  {
    id: 'Editar',
    accessorKey: 'id',
    header: 'Editar',
    cell: ({ row }) => {
      const modalHandler = ModalHandler();
      return (
        <ButtonEdit
          name={row.original.name}>
          <EmployeeForm
            item={row.original}
            onSubmit={UpdateEmployee}/>
        </ButtonEdit>
      )
    },
  },
];

export default EmployeeColumns