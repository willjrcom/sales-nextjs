import { useState } from "react";
import Category from "@/app/entities/category/category";
import Quantity from "@/app/entities/quantity/quantity";
import QuantityForm from "@/app/forms/quantity/form";
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

interface ListQuantityProps {
    category: Category;
}

const ListQuantity = ({ category: initialCategory }: ListQuantityProps) => {
    const { data: session } = useSession();
    const [editingQuantity, setEditingQuantity] = useState<Quantity | null>(null);
    const [isNewOpen, setIsNewOpen] = useState(false);

    // Usa useQuery para manter os dados sincronizados
    const { data: category, refetch } = useQuery({
        queryKey: ['category', initialCategory.id],
        queryFn: () => GetCategoryByID(initialCategory.id, session!),
        enabled: !!session && !!initialCategory.id,
        initialData: initialCategory,
    });

    const currentCategory = category || initialCategory;
    const quantities = [...(currentCategory?.quantities || [])].sort((a, b) => a.quantity - b.quantity);
    const isDefaultCategory = !currentCategory.is_additional && !currentCategory.is_complement;

    const handleSuccess = () => {
        refetch();
        setEditingQuantity(null);
        setIsNewOpen(false);
    };

    return (
        <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Quantidades</h2>
            <div className="flex flex-wrap gap-4">
                {quantities.map((quantity) => (
                    <Dialog key={quantity.id} open={editingQuantity?.id === quantity.id} onOpenChange={(open) => !open && setEditingQuantity(null)}>
                        <DialogTrigger asChild>
                            <div
                                onClick={() => setEditingQuantity(quantity)}
                                className="border p-2 rounded-md text-center bg-white w-32 cursor-pointer hover:bg-gray-50 transition-colors"
                            >
                                {quantity.quantity}
                            </div>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Editar quantidade: {quantity.quantity}</DialogTitle>
                            </DialogHeader>
                            <QuantityForm 
                                category={currentCategory} 
                                isUpdate={true} 
                                item={quantity} 
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
                                Quantidade
                            </div>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Nova Quantidade</DialogTitle>
                            </DialogHeader>
                            <QuantityForm 
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

export default ListQuantity