import { useState, useEffect } from "react";
import Category from "@/app/entities/category/category";
import Carousel from "@/app/components/carousel/carousel";
import { FaTags } from 'react-icons/fa';
import Image from "next/image";

interface CategorySelectorProps {
    additionalCategories: Category[];
    selectedCategory: Category; // Categoria que possui o produto
    setSelectedCategory: React.Dispatch<React.SetStateAction<Category>>; // Função para atualizar a categoria
}

const AdditionalCategorySelector = ({ additionalCategories, selectedCategory, setSelectedCategory }: CategorySelectorProps) => {
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
        } else {
            // Adicionar categoria
            setSelectedCategories(prev => [...(prev || []), category]);  // Garantir que prev é um array
            // Adicionar à lista de categories.additional_categories
            setSelectedCategory(prev => ({
                ...prev,
                additional_categories: [...(prev.additional_categories || []), category] // Garantir que prev é um array
            }));
        }
    };

    const filteredCategories = additionalCategories?.filter(cat => cat.is_additional) || [];

    return (
        <div>
            <h4 className="text-md font-medium mb-4">Categorias adicional</h4>
            <Carousel items={filteredCategories}>
                {(category) => {
                    const isSelected = selectedCategories?.some(cat => cat.id === category.id);
                    return (
                        <div
                            key={category.id}
                            className={`flex flex-col items-center p-4 border rounded-lg shadow-md cursor-pointer transition-transform transform ${isSelected ? 'bg-blue-50 border-blue-500' : 'bg-white border-gray-200'} hover:shadow-lg hover:scale-105`}
                            onClick={() => handleCategorySelection(category)}
                        >
                            {category.image_path ? (
                                <Image src={category.image_path} alt={category.name} className="w-full h-32 object-cover rounded-md mb-4" />
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
            {filteredCategories.length === 0 && <p className="text-sm text-gray-500">Nenhuma categoria adicional encontrada.</p>}
        </div>
    );
};

export default AdditionalCategorySelector;
