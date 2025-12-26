import ButtonIconText from "@/app/components/button/button-icon-text";
import Size from "@/app/entities/size/size";
import SizeForm from "@/app/forms/size/form";
import { useModal } from "@/app/context/modal/context";
import Category from "@/app/entities/category/category";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import GetCategoryByID from "@/app/api/category/[id]/category";
import { useSession } from "next-auth/react";

interface ListSizeProps {
    category: Category;
}

const ListSize = ({ category: initialCategory }: ListSizeProps) => {
    const modalHandler = useModal();
    const queryClient = useQueryClient();
    const { data: session } = useSession();

    // Usa useQuery para manter os dados sincronizados
    const { data: category } = useQuery({
        queryKey: ['category', initialCategory.id],
        queryFn: () => GetCategoryByID(initialCategory.id, session!),
        enabled: !!session && !!initialCategory.id,
        initialData: initialCategory, // Usa os dados iniciais enquanto não recarrega
    });

    const currentCategory = category || initialCategory;
    if (currentCategory?.sizes === undefined || currentCategory?.sizes.length === 0) currentCategory!.sizes = [];

    const onClose = (id?: string) => {
        if (id) modalHandler.hideModal("edit-size-" + id);
        else modalHandler.hideModal("new-size");
    }

    const onEdit = (size: Size) => {
        const modalName = "edit-size-" + size.id;
        const title = "Editar tamanho: " + size.name;
        const elem = <SizeForm category={currentCategory} isUpdate={true} item={size} />
        modalHandler.showModal(modalName, title, elem, "md", () => onClose(size.id))
    }

    const sizes = [...(currentCategory?.sizes || [])].sort((a, b) => a.name.localeCompare(b.name))
    const isDefaultCategory = !currentCategory.is_additional && !currentCategory.is_complement;

    return (
        <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Tamanhos</h2>
            <div className="flex flex-wrap gap-4">
                {sizes.map((size) => (
                    <div
                        onClick={() => onEdit(size)}
                        key={size.id}
                        className="border p-2 rounded-md text-center bg-white w-32 cursor-pointer"
                    >
                        {size.name}
                    </div>
                ))}
                {isDefaultCategory && (
                    <ButtonIconText modalName="new-size" title="Tamanho">
                        <SizeForm category={currentCategory} />
                    </ButtonIconText>
                )}
            </div>
        </div>
    )
}

export default ListSize