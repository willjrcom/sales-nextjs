import { Dispatch, SetStateAction, useMemo, useState } from "react";
import Category from "@/app/entities/category/category";
import { FaPlusCircle } from 'react-icons/fa';
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { GetCategoriesComplement } from "@/app/api/category/category";
import Refresh, { FormatRefreshTime } from "@/app/components/crud/refresh";

interface CategorySelectorProps {
    selectedCategory: Category; // Categoria que possui o produto
    setSelectedCategory: Dispatch<SetStateAction<Category>>; // Função para atualizar a categoria
}

const ComplementCategorySelector = ({ selectedCategory, setSelectedCategory }: CategorySelectorProps) => {
    const { data } = useSession();
    const [lastUpdate, setLastUpdate] = useState<string>(FormatRefreshTime(new Date()));
    const { isPending, data: complementCategoriesResponse, refetch } = useQuery({
        queryKey: ['complement-categories'],
        queryFn: async () => {
            setLastUpdate(FormatRefreshTime(new Date()));
            return GetCategoriesComplement(data!);
        },
        enabled: !!data?.user?.access_token,
        refetchInterval: 60000,
    });

    const [selectedCategories, setSelectedCategories] = useState<Category[]>(selectedCategory.complement_categories);

    const handleCategorySelection = (category: Category) => {
        const isSelected = selectedCategories?.some(cat => cat.id === category.id);

        if (isSelected) {
            // Remover categoria selecionada
            setSelectedCategories(prev => prev.filter(cat => cat.id !== category.id));
            // Remover da lista de categories.complement_categories
            setSelectedCategory(prev => ({
                ...prev,
                complement_categories: prev.complement_categories.filter(cat => cat.id !== category.id)
            }));
        } else {
            // Adicionar categoria
            setSelectedCategories(prev => [...(prev || []), category]);  // Garantir que prev é um array
            // Adicionar à lista de categories.complement_categories
            setSelectedCategory(prev => ({
                ...prev,
                complement_categories: [...(prev.complement_categories || []), category] // Garantir que prev é um array
            }));
        }
    };

    const complementCategories = useMemo(() => complementCategoriesResponse || [], [complementCategoriesResponse]);

    return (
        <div className="w-full overflow-x-hidden">
            <div className="flex items-center mb-4 space-x-2">
                <h4 className="text-md font-medium">Categorias complemento</h4>
                <Refresh removeText
                    onRefresh={refetch}
                    isPending={isPending}
                    lastUpdate={lastUpdate}
                />
            </div>
            <div className="w-full grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto overflow-x-hidden pr-2 custom-scrollbar">
                {complementCategories.map((category) => {
                    const isSelected = selectedCategories?.some(cat => cat.id === category.id);
                    return (
                        <div
                            key={category.id}
                            className={`flex flex-col items-center p-3 border rounded-lg shadow-sm cursor-pointer transition-all duration-200 min-w-0 ${isSelected ? 'bg-green-50 border-green-500 ring-1 ring-green-500' : 'bg-white border-gray-200 hover:border-gray-300'} hover:shadow-md`}
                            onClick={() => handleCategorySelection(category)}
                        >
                            {category.image_path ? (
                                <Image
                                    src={category.image_path}
                                    alt={category.name}
                                    className="w-full h-20 object-cover rounded-md mb-2"
                                    width={100}
                                    height={100}
                                />
                            ) : (
                                <div className="w-full h-20 bg-gray-50 rounded-md flex items-center justify-center mb-2">
                                    <FaPlusCircle className="text-xl text-gray-300" />
                                </div>
                            )}
                            <h3 className="text-xs font-semibold text-center mb-1 line-clamp-2 leading-tight w-full px-1">{category.name}</h3>
                            <span className="text-xs text-gray-500 truncate w-full text-center">Complemento</span>
                            {isSelected && (
                                <span className="text-xs font-medium text-green-600 mt-1">✓</span>
                            )}
                        </div>
                    );
                })}
            </div>
            {complementCategories?.length === 0 && <p className="text-sm text-gray-500">Nenhuma categoria complemento encontrada.</p>}
        </div>
    );
};

export default ComplementCategorySelector;
