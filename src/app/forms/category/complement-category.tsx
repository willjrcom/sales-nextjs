import { useState } from "react";
import Category from "@/app/entities/category/category";
import Carousel from "@/app/components/carousel/carousel";
import { FaPlusCircle } from 'react-icons/fa';
import Image from "next/image";

interface CategorySelectorProps {
    complementCategories: Category[];
    selectedCategory: Category; // Categoria que possui o produto
    setSelectedCategory: React.Dispatch<React.SetStateAction<Category>>; // Função para atualizar a categoria
}

const ComplementCategorySelector = ({ complementCategories, selectedCategory, setSelectedCategory }: CategorySelectorProps) => {
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

    const filteredCategories = complementCategories.filter(cat => cat.is_complement)

    return (
        <div>
            <h4 className="text-md font-medium mb-4">Categorias complemento</h4>
            <Carousel items={filteredCategories}>
                {(category) => {
                    const isSelected = selectedCategories?.some(cat => cat.id === category.id);
                    return (
                        <div
                            key={category.id}
                            className={`flex flex-col items-center p-4 border rounded-lg shadow-md cursor-pointer transition-transform transform ${isSelected ? 'bg-green-50 border-green-500' : 'bg-white border-gray-200'} hover:shadow-lg hover:scale-105`}
                            onClick={() => handleCategorySelection(category)}
                        >
                            {category.image_path ? (
                                <Image
                                    src={category.image_path}
                                    alt={category.name}
                                    className="w-full h-32 object-cover rounded-md mb-4"
                                    width={100}
                                    height={100}
                                />
                            ) : (
                                <FaPlusCircle className="text-4xl text-gray-300 mb-4" />
                            )}
                            <h3 className="text-md font-semibold text-center mb-1">{category.name}</h3>
                            <span className="text-sm text-gray-500">Categoria Complemento</span>
                            {isSelected ? (
                                <span className="mt-2 text-xs font-medium text-green-600">Selecionado</span>
                            ) : (
                                <span className="mt-2 text-xs text-gray-400">&nbsp;</span>
                            )}
                        </div>
                    );
                }}
            </Carousel>
            {filteredCategories?.length === 0 && <p className="text-sm text-gray-500">Nenhuma categoria complemento encontrada.</p>}
        </div>
    );
};

export default ComplementCategorySelector;
