import { useState, useEffect, Dispatch, SetStateAction, useMemo } from "react";
import Category from "@/app/entities/category/category";
import { FaTags } from 'react-icons/fa';
import Image from "next/image";
import { GetCategoriesAdditional } from "@/app/api/category/category";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import Refresh, { FormatRefreshTime } from "@/app/components/crud/refresh";

interface CategorySelectorProps {
    selectedCategory: Category; // Categoria que possui o produto
    setSelectedCategory: Dispatch<SetStateAction<Category>>; // Função para atualizar a categoria
}

const AdditionalCategorySelector = ({ selectedCategory, setSelectedCategory }: CategorySelectorProps) => {
    const { data } = useSession();
    const [lastUpdate, setLastUpdate] = useState<string>(FormatRefreshTime(new Date()));
    const { isPending, data: additionalCategoriesResponse, refetch } = useQuery({
        queryKey: ['additional-categories'],
        queryFn: async () => {
            setLastUpdate(FormatRefreshTime(new Date()));
            return GetCategoriesAdditional(data!);
        },
        enabled: !!data?.user?.access_token,
        refetchInterval: 60000,
    });

    // Garantir que selectedCategories seja sempre um array
    const [selectedCategories, setSelectedCategories] = useState<Category[]>(selectedCategory.additional_categories || []);

    useEffect(() => {
        // Sincronizar selectedCategories com additional_categories quando selectedCategory mudar
        setSelectedCategories(selectedCategory.additional_categories || []);
    }, [selectedCategory]);

    const handleCategorySelection = (category: Category) => {
        const isSelected = selectedCategories?.some(cat => cat.id === category.id);

        if (isSelected) {
            // Remover categoria selecionada
            setSelectedCategories(prev => prev.filter(cat => cat.id !== category.id));
            // Remover da lista de categories.additional_categories
            setSelectedCategory(prev => ({
                ...prev,
                additional_categories: prev.additional_categories.filter(cat => cat.id !== category.id)
            }));
            return;
        }

        // Adicionar categoria
        setSelectedCategories(prev => [...(prev || []), category]);  // Garantir que prev é um array
        // Adicionar à lista de categories.additional_categories
        setSelectedCategory(prev => ({
            ...prev,
            additional_categories: [...(prev.additional_categories || []), category] // Garantir que prev é um array
        }));

    };

    const additionalCategories = useMemo(() => additionalCategoriesResponse || [], [additionalCategoriesResponse]);

    return (
        <div className="w-full overflow-x-hidden">
            <div className="flex items-center mb-4 space-x-2">
                <h4 className="text-md font-medium">Categorias adicional</h4>
                <Refresh removeText
                    onRefresh={refetch}
                    isPending={isPending}
                    lastUpdate={lastUpdate}
                />
            </div>
            <div className="w-full grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto overflow-x-hidden pr-2 custom-scrollbar">
                {additionalCategories.map((category) => {
                    const isSelected = selectedCategories?.some(cat => cat.id === category.id);
                    return (
                        <div
                            key={category.id}
                            className={`flex flex-col items-center p-3 border rounded-lg shadow-sm cursor-pointer transition-all duration-200 min-w-0 ${isSelected ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500' : 'bg-white border-gray-200 hover:border-gray-300'} hover:shadow-md`}
                            onClick={() => handleCategorySelection(category)}
                        >
                            {category.image_path ? (
                                <Image src={category.image_path}
                                    alt={category.name}
                                    className="w-full h-20 object-cover rounded-md mb-2"
                                    width={100}
                                    height={100}
                                />
                            ) : (
                                <div className="w-full h-20 bg-gray-50 rounded-md flex items-center justify-center mb-2">
                                    <FaTags className="text-xl text-gray-300" />
                                </div>
                            )}
                            <h3 className="text-xs font-semibold text-center mb-1 line-clamp-2 leading-tight w-full px-1">{category.name}</h3>
                            <span className="text-xs text-gray-500 truncate w-full text-center">Adicional</span>
                            {isSelected && (
                                <span className="text-xs font-medium text-blue-600 mt-1">✓</span>
                            )}
                        </div>
                    );
                })}
            </div>
            {additionalCategories.length === 0 && <p className="text-sm text-gray-500">Nenhuma categoria adicional encontrada.</p>}
        </div>
    );
};

export default AdditionalCategorySelector;
