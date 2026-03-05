import { ColumnDef } from "@tanstack/react-table";
import Employee from "./employee";
import ButtonIcon from "@/app/components/button/button-icon";
import Contact from "../contact/contact";
import Address from "../address/address";
import React from "react";
import EmployeeCard from "@/app/forms/employee/employee-card";
import EmployeePermissionsTab from "@/app/forms/employee/tabs/permissions";


const EmployeeColumns = (email?: string): ColumnDef<Employee>[] => [
  {
    id: 'Nome',
    accessorKey: 'name',
    header: 'Nome',
    cell: ({ row }) => {
      const isYou = email === row.original.email;
      return (
        <span>
          {row.original.name} {isYou && <span className="text-red-400 text-xs italic">(Você)</span>}
        </span>
      );
    }
  },
  {
    id: 'Contato',
    header: 'Contato',
    accessorFn: row => {
      if (row.contact as Contact) {
        const contact = row.contact as Contact
        return contact.number
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
        <ButtonIcon modalName={"view-employee-" + row.original.id}
          title={"Visualizar " + row.original.name}>
          <EmployeeCard item={row.original} />
        </ButtonIcon>
      )
    },
  },
  {
    id: 'Permissões',
    accessorKey: 'permissions',
    header: 'Permissões',
    cell: ({ row }) => {
      return (
        <ButtonIcon modalName={"view-employee-" + row.original.id}
          title={"Visualizar " + row.original.name}>
          <EmployeePermissionsTab item={row.original} />
        </ButtonIcon>
      )
    },
  }
];

export default EmployeeColumns