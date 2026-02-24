import { ColumnDef } from "@tanstack/react-table";
import { FaEdit } from "react-icons/fa";
import { Advertising } from "@/app/entities/advertising/advertising";
import ButtonIcon from "@/app/components/button/button-icon";
import AdvertisingForm from "@/app/forms/advertising/form";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const AdvertisingColumns = (): ColumnDef<Advertising>[] => [
    {
        accessorKey: "title",
        header: "Título",
    },
    {
        accessorKey: "type",
        header: "Tipo",
        cell: ({ row }) => <span className="capitalize">{row.original.type}</span>
    },
    {
        accessorKey: "sponsor.name",
        header: "Patrocinador",
    },
    {
        id: "validity",
        header: "Vigência",
        cell: ({ row }) => {
            const { started_at, ended_at } = row.original;
            const start = started_at ? format(new Date(started_at), "dd/MM/yyyy", { locale: ptBR }) : "--";
            const end = ended_at ? format(new Date(ended_at), "dd/MM/yyyy", { locale: ptBR }) : "--";
            return <span>{start} - {end}</span>;
        }
    },
    {
        accessorKey: "contact",
        header: "Contato",
    },
    {
        id: "actions",
        header: "Ações",
        cell: ({ row }) => {
            const ad = row.original;
            return (
                <div className="flex gap-2">
                    <ButtonIcon
                        icon={FaEdit}
                        modalName={`edit-advertising-${ad.id}`}
                        title="Editar Propaganda"
                    >
                        <AdvertisingForm item={ad} isUpdate />
                    </ButtonIcon>
                </div>
            )
        }
    }
];
