import { useState } from "react";
import Size from "@/app/entities/size/size";
import SizeForm from "@/app/forms/size/form";
import Category from "@/app/entities/category/category";
import { useQuery } from "@tanstack/react-query";
import GetCategoryByID from "@/app/api/category/[id]/category";
import { useSession } from "next-auth/react";
import { FaPlus } from "react-icons/fa";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

interface ListSizeProps {
    category: Category;
}

const ListSize = ({ category: initialCategory }: ListSizeProps) => {
    const { data: session } = useSession();
    const [editingSize, setEditingSize] = useState<Size | null>(null);
    const [isNewOpen, setIsNewOpen] = useState(false);

    // Usa useQuery para manter os dados sincronizados
    const { data: category, refetch } = useQuery({
        queryKey: ['category', initialCategory.id],
        queryFn: () => GetCategoryByID(session!, initialCategory.id),
        enabled: !!session && !!initialCategory.id,
        initialData: initialCategory,
    });

    const currentCategory = category || initialCategory;
    const sizes = [...(currentCategory?.sizes || [])].sort((a, b) => a.name.localeCompare(b.name));
    const isDefaultCategory = !currentCategory.is_additional && !currentCategory.is_complement;

    const handleSuccess = () => {
        refetch();
        setEditingSize(null);
        setIsNewOpen(false);
    };

    return (
        <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Tamanhos</h2>
            <div className="flex flex-wrap gap-4">
                {sizes.map((size) => (
                    <Dialog key={size.id} open={editingSize?.id === size.id} onOpenChange={(open) => !open && setEditingSize(null)}>
                        <DialogTrigger asChild>
                            <div
                                onClick={() => setEditingSize(size)}
                                className="border p-2 rounded-md text-center bg-white w-32 cursor-pointer hover:bg-gray-50 transition-colors"
                            >
                                {size.name}
                            </div>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Editar tamanho: {size.name}</DialogTitle>
                            </DialogHeader>
                            <SizeForm
                                category={currentCategory}
                                isUpdate={true}
                                item={size}
                                onSuccess={handleSuccess}
                            />
                        </DialogContent>
                    </Dialog>
                ))}

                {isDefaultCategory && (
                    <Dialog open={isNewOpen} onOpenChange={setIsNewOpen}>
                        <DialogTrigger asChild>
                            <div className="border p-2 rounded-md text-center bg-blue-500 text-white w-32 cursor-pointer hover:bg-blue-600 transition-colors flex items-center justify-center gap-2">
                                <FaPlus size={12} />
                                Tamanho
                            </div>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Novo Tamanho</DialogTitle>
                            </DialogHeader>
                            <SizeForm
                                category={currentCategory}
                                onSuccess={handleSuccess}
                            />
                        </DialogContent>
                    </Dialog>
                )}
            </div>
        </div>
    )
}

export default ListSize