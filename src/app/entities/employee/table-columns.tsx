import { ColumnDef } from "@tanstack/react-table";
import Employee  from "./employee";
import ButtonIcon from "@/app/components/button/button-icon";
import Contact from "../contact/contact";
import Address from "../address/address";
import React from "react";
import EmployeeCard from "@/app/forms/employee/employee-card";


const EmployeeColumns = (): ColumnDef<Employee>[] => [
  {
    id: 'Nome',
    accessorKey: 'name',
    header: 'Nome',
  },
  {
    id: 'Contato',
    header: 'Contato',
    accessorFn: row => {
      if (row.contact as Contact) {
        const contact = row.contact as Contact
        if (contact.ddd || contact.number) {
          return "(" + contact.ddd + ") " + contact.number
        }
        return contact.ddd + " " + contact.number
      }
    },
  },
  {
    id: 'CPF',
    accessorKey: 'cpf',
    header: 'CPF',
  },
  {
    id: 'Endereço',
    header: 'Endereço',
    accessorFn: row => {
      if (row.address as Address) {
        return row.address.street + ", " + row.address.number
      }
    },
  },
  {
    id: 'Visualizar',
    accessorKey: 'id',
    header: 'Visualizar',
    cell: ({ row }) => {
      return (
        <ButtonIcon modalName={"view-employee-" + row.original.id }
          title={"Visualizar " + row.original.name}>
          <EmployeeCard item={row.original} />
        </ButtonIcon>
      )
    },
  },
];

export default EmployeeColumns