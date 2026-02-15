import { ColumnDef } from "@tanstack/react-table";
import ButtonIconTextFloat from "@/app/components/button/button-float";
import { FaEdit } from "react-icons/fa";
import { CompanyCategory } from "@/app/entities/company/company-category";
import CompanyCategoryForm from "@/app/forms/company-category/form";
import ButtonIcon from "@/app/components/button/button-icon";

export const CompanyCategoryColumns = (): ColumnDef<CompanyCategory>[] => [
    {
        accessorKey: "name",
        header: "Nome",
    },
    {
        id: "actions",
        header: "Ações",
        cell: ({ row }) => {
            const category = row.original;
            return (
                <div className="flex gap-2">
                    <ButtonIcon
                        icon={FaEdit}
                        modalName={`edit-company-category-${category.id}`}
                        title="Editar Categoria"
                    >
                        <CompanyCategoryForm item={category} isUpdate />
                    </ButtonIcon>
                </div>
            )
        }
    }
];
