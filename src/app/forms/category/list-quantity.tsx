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
import GetQuantitiesByCategoryID from "@/app/api/quantity/quantity";
import Refresh, { FormatRefreshTime } from "@/app/components/crud/refresh";
import { CheckboxField } from "@/app/components/modal/field";

interface ListQuantityProps {
    categoryID: string;
    isDefaultCategory: boolean;
}

const ListQuantity = ({ categoryID, isDefaultCategory }: ListQuantityProps) => {
    const { data: session } = useSession();
    const [editingQuantity, setEditingQuantity] = useState<Quantity | null>(null);
    const [isNewOpen, setIsNewOpen] = useState(false);
    const [showInactive, setShowInactive] = useState(false);
    const [lastUpdate, setLastUpdate] = useState<string>(FormatRefreshTime(new Date()));

    // Usa useQuery para manter os dados sincronizados
    const { data: quantities, refetch, isPending } = useQuery({
        queryKey: ['quantities', categoryID],
        queryFn: () => {
            setLastUpdate(FormatRefreshTime(new Date()));
            return GetQuantitiesByCategoryID(session!, categoryID);
        },
        enabled: !!session && !!categoryID,
    });

    const filteredQuantities = quantities?.filter(q => showInactive || q.is_active) || [];
    const sortedQuantities = [...filteredQuantities].sort((a, b) => a.quantity - b.quantity);

    const handleSuccess = () => {
        refetch();
        setEditingQuantity(null);
        setIsNewOpen(false);
    };

    return (
        <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold mb-4">Quantidades</h2>
                <div className="flex gap-4 items-center">
                    <CheckboxField
                        friendlyName="Mostrar inativos"
                        name="show_inactive"
                        value={showInactive}
                        setValue={setShowInactive}
                    />
                    <Refresh onRefresh={refetch} isPending={isPending} lastUpdate={lastUpdate} />
                </div>
            </div>
            <div className="flex flex-wrap gap-4">
                {sortedQuantities.map((quantity) => (
                    <Dialog key={quantity.id} open={editingQuantity?.id === quantity.id} onOpenChange={(open) => !open && setEditingQuantity(null)}>
                        <DialogTrigger asChild>
                            <div
                                onClick={() => setEditingQuantity(quantity)}
                                className={`border p-2 rounded-md text-center ${quantity.is_active ? ' hover:bg-gray-100' : 'bg-gray-200 hover:bg-gray-300'} w-32 cursor-pointer transition-colors`}
                            >
                                {quantity.quantity}
                            </div>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Editar quantidade: {quantity.quantity}</DialogTitle>
                            </DialogHeader>
                            <QuantityForm
                                categoryID={categoryID}
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
                                categoryID={categoryID}
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