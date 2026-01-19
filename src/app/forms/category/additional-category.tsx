import { useState, useEffect, Dispatch, SetStateAction, useMemo } from "react";
import Category from "@/app/entities/category/category";
import Carousel from "@/app/components/carousel/carousel";
import { FaTags, FaRedo } from 'react-icons/fa';
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
        <div>
            <div className="flex items-center mb-4 space-x-2">
                <h4 className="text-md font-medium">Categorias adicional</h4>
                <Refresh removeText
                    onRefresh={refetch}
                    isPending={isPending}
                    lastUpdate={lastUpdate}
                />
            </div>
            <Carousel items={additionalCategories}>
                {(category) => {
                    const isSelected = selectedCategories?.some(cat => cat.id === category.id);
                    return (
                        <div
                            key={category.id}
                            className={`flex flex-col items-center p-4 border rounded-lg shadow-md cursor-pointer transition-transform transform ${isSelected ? 'bg-blue-50 border-blue-500' : 'bg-white border-gray-200'} hover:shadow-lg hover:scale-105`}
                            onClick={() => handleCategorySelection(category)}
                        >
                            {category.image_path ? (
                                <Image src={category.image_path}
                                    alt={category.name}
                                    className="w-full h-32 object-cover rounded-md mb-4"
                                    width={100}
                                    height={100}
                                />
                            ) : (
                                <FaTags className="text-4xl text-gray-300 mb-4" />
                            )}
                            <h3 className="text-md font-semibold text-center mb-1">{category.name}</h3>
                            <span className="text-sm text-gray-500">Categoria Adicional</span>
                            {isSelected ? (
                                <span className="mt-2 text-xs font-medium text-blue-600">Selecionado</span>
                            ) : (
                                <span className="mt-2 text-xs text-gray-400">&nbsp;</span>
                            )}
                        </div>
                    );
                }}
            </Carousel>
            {additionalCategories.length === 0 && <p className="text-sm text-gray-500">Nenhuma categoria adicional encontrada.</p>}
        </div>
    );
};

export default AdditionalCategorySelector;
