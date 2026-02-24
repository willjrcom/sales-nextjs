import { ColumnDef } from "@tanstack/react-table";
import { FaEdit } from "react-icons/fa";
import { Sponsor } from "@/app/entities/sponsor/sponsor";
import ButtonIcon from "@/app/components/button/button-icon";
import SponsorForm from "@/app/forms/sponsor/form";

export const SponsorColumns = (): ColumnDef<Sponsor>[] => [
    {
        accessorKey: "name",
        header: "Nome",
    },
    {
        accessorKey: "cnpj",
        header: "CNPJ",
    },
    {
        accessorKey: "email",
        header: "Email",
    },
    {
        accessorKey: "contact",
        header: "Contato",
    },
    {
        id: "actions",
        header: "Ações",
        cell: ({ row }) => {
            const sponsor = row.original;
            return (
                <div className="flex gap-2">
                    <ButtonIcon
                        icon={FaEdit}
                        modalName={`edit-sponsor-${sponsor.id}`}
                        title="Editar Patrocinador"
                    >
                        <SponsorForm item={sponsor} isUpdate />
                    </ButtonIcon>
                </div>
            )
        }
    }
];
