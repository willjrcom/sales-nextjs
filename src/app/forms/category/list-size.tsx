import ButtonIconText from "@/app/components/button/button-icon-text";
import Size from "@/app/entities/size/size";
import SizeForm from "@/app/forms/size/form";
import { useModal } from "@/app/context/modal/context";
import Category from "@/app/entities/category/category";
import { Dispatch, SetStateAction, useState } from "react";

interface ListSizeProps {
    category: Category;
    setCategory: Dispatch<SetStateAction<Category | null>>;
}

const ListSize = ({ category, setCategory }: ListSizeProps) => {
    const modalHandler = useModal();
    const [sizes, setSizes] = useState<Size[]>(() => [...(category?.sizes || [])]);

    const handleSizesChange = (builder: (prev: Size[]) => Size[]) => {
        let nextSizes: Size[] = [];
        setSizes(prev => {
            nextSizes = builder(prev);
            return nextSizes;
        });

        setCategory(prev => prev ? { ...prev, sizes: nextSizes } : prev);
        return nextSizes;
    };

    const onClose = (id?: string) => {
        if (id) modalHandler.hideModal("edit-size-" + id);
        else modalHandler.hideModal("new-size");
    }

    const onEdit = (size: Size) => {
        const modalName = "edit-size-" + size.id;
        const title = "Editar tamanho: " + size.name;
        const elem = <SizeForm category={category} onSizesChange={handleSizesChange} isUpdate={true} item={size} />
        modalHandler.showModal(modalName, title, elem, "md", () => onClose(size.id))
    }

    const sortedSizes = [...sizes].sort((a, b) => a.name.localeCompare(b.name))
    const isDefaultCategory = !category.is_additional && !category.is_complement;

    return (
        <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Tamanhos</h2>
            <div className="flex flex-wrap gap-4">
                {sortedSizes.map((size) => (
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
                        <SizeForm category={category} onSizesChange={handleSizesChange} />
                    </ButtonIconText>
                )}
            </div>
        </div>
    )
}

export default ListSize