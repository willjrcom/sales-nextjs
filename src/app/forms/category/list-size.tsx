import ButtonIconText from "@/app/components/button/button-icon-text";
import Size from "@/app/entities/size/size";
import SizeForm from "@/app/forms/size/form";
import { useModal } from "@/app/context/modal/context";
import Category from "@/app/entities/category/category";

interface ListSizeProps {
    category: Category;
}

const ListSize = ({ category }: ListSizeProps) => {
    const modalHandler = useModal();
    if (category?.sizes === undefined || category?.sizes.length === 0) category!.sizes = [];

    const onClose = (id?: string) => {
        if (id) modalHandler.hideModal("edit-size-" + id);
        else modalHandler.hideModal("new-size");
    }

    const onEdit = (size: Size) => {
        const modalName = "edit-size-" + size.id;
        const title = "Editar quantidade: " + size.name;
        const elem = <SizeForm category={category} isUpdate={true} item={size} />
        modalHandler.showModal(modalName, title, elem, "md", () => onClose(size.id))
    }

    const sizes = [...(category?.sizes || [])].sort((a, b) => a.name.localeCompare(b.name))
    const isDefaultCategory = !category.is_additional && !category.is_complement;

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
                        <SizeForm category={category} />
                    </ButtonIconText>
                )}
            </div>
        </div>
    )
}

export default ListSize