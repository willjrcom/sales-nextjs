import { ColumnDef } from "@tanstack/react-table";
import Employee  from "./employee";
import ButtonEdit from "@/app/components/crud/button-edit";
import PersonColumns from "../person/table-columns";
import ModalHandler from "@/app/components/modal/modal";
import { useRouter } from "next/router";
import EmployeeForm from "@/app/forms/employee/form";
import UpdateEmployee from "@/app/api/employee/update/route";


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
          name={row.original.name}
          href={`/client/edit/${row.original.id}`}>
          <EmployeeForm
            item={row.original}
            onSubmit={UpdateEmployee}
            handleCloseModal={() => modalHandler.setShowModal(false)}
            reloadData={Redirect} />
        </ButtonEdit>
      )
    },
  },
];

const Redirect = () => {
  const router = useRouter();
  router.reload();
}

export default EmployeeColumns