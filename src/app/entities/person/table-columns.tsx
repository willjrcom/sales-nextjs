import { ColumnDef } from "@tanstack/react-table";
import Person from "./person";
import Contact from "../contact/contact";
import Address from "../address/address";
import { format, toZonedTime } from "date-fns-tz";

const PersonColumns = <T extends Person,>(): ColumnDef<T>[] => [
  {
    id: 'Nome',
    accessorKey: 'name',
    header: 'Nome',
  },
  {
    id: 'E-mail',
    accessorKey: 'email',
    header: 'E-mail',
  },
  {
    id: 'Cpf',
    accessorKey: 'cpf',
    header: 'Cpf',
  },
  {
    id: 'Nascimento',
    accessorKey: 'birthday',
    header: 'Nascimento',
    accessorFn: row => {
      if (!row.birthday) return "--/--/--"

      // Converte a data original para o fuso horário correto
      const utcDate = new Date(row.birthday);
      const zonedDate = toZonedTime(utcDate, "UTC"); // Usa UTC para evitar problemas de fuso horário

      // Formata a data corretamente
      const formattedDate = format(zonedDate, "dd/MM/yyyy", { timeZone: "UTC" });

      return formattedDate;
    }
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
    id: 'Endereço',
    header: 'Endereço',
    accessorFn: row => {
      if (row.address as Address) {
        return row.address.street + ", " + row.address.number
      }
    },
  },
];

export default PersonColumns