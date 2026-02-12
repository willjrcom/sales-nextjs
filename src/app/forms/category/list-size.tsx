import { useState } from "react";
import Size from "@/app/entities/size/size";
import SizeForm from "@/app/forms/size/form";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { FaPlus } from "react-icons/fa";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import GetSizesByCategoryID from "@/app/api/size/size";
import Refresh, { FormatRefreshTime } from "@/app/components/crud/refresh";
import { CheckboxField } from "@/app/components/modal/field";
import ThreeColumnHeader from "@/components/header/three-column-header";

interface ListSizeProps {
    categoryID: string;
    isDefaultCategory: boolean;
}

const ListSize = ({ categoryID, isDefaultCategory }: ListSizeProps) => {
    const { data: session } = useSession();
    const [editingSize, setEditingSize] = useState<Size | null>(null);
    const [isNewOpen, setIsNewOpen] = useState(false);
    const [showInactive, setShowInactive] = useState(false);
    const [lastUpdate, setLastUpdate] = useState<string>(FormatRefreshTime(new Date()));

    // Usa useQuery para manter os dados sincronizados
    const { data: sizes, refetch, isPending } = useQuery({
        queryKey: ['sizes', categoryID],
        queryFn: () => {
            setLastUpdate(FormatRefreshTime(new Date()));
            return GetSizesByCategoryID(session!, categoryID);
        },
        enabled: !!session?.user?.access_token && !!categoryID,
    });

    const filteredSizes = sizes?.filter(s => showInactive || s.is_active) || [];
    const sortedSizes = [...filteredSizes].sort((a, b) => a.name.localeCompare(b.name));

    const handleSuccess = () => {
        refetch();
        setEditingSize(null);
        setIsNewOpen(false);
    };

    return (
        <div className="w-full">
            <ThreeColumnHeader left={<CheckboxField
                friendlyName="Mostrar inativos"
                name="show_inactive"
                value={showInactive}
                setValue={setShowInactive}
            />}
                center={<h2 className="text-xl font-bold mb-4">Tamanhos</h2>}
                right={<Refresh onRefresh={refetch} isPending={isPending} lastUpdate={lastUpdate} />}></ThreeColumnHeader>

            <div className="flex flex-wrap gap-4">
                {sortedSizes.map((size) => (
                    <Dialog key={size.id} open={editingSize?.id === size.id} onOpenChange={(open) => !open && setEditingSize(null)}>
                        <DialogTrigger asChild>
                            <div
                                onClick={() => setEditingSize(size)}
                                className={`border p-2 rounded-md text-center ${size.is_active ? ' hover:bg-gray-100' : 'bg-gray-200 hover:bg-gray-300'} w-32 cursor-pointer transition-colors`}
                            >
                                {size.name}
                            </div>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Editar tamanho: {size.name}</DialogTitle>
                            </DialogHeader>
                            <SizeForm
                                isUpdate={true}
                                item={size}
                                categoryID={categoryID}
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

export default ListSize