import { useState } from "react";
import Category from "@/app/entities/category/category";
import Carousel from "@/app/components/carousel/carousel";
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
                            className={`border p-3 rounded-lg cursor-pointer ${isSelected ? 'bg-blue-100' : 'bg-white'}`}
                            onClick={() => handleCategorySelection(category)}
                        >
                            {category.image_path &&
                                <Image src={category.image_path} alt={category.name} className="w-full h-32 object-cover rounded-md mb-4" />
                            }
                            
                            <h3 className="text-md font-bold text-center">{category.name}</h3>

                            {isSelected && <p className="text-sm text-blue-600 text-right">Adicionado</p>}
                            {!isSelected && <p className="text-sm text-gray-500 text-right">&nbsp;</p>}
                        </div>
                    )
                }}
            </Carousel>
            {filteredCategories?.length === 0 && <p className="text-sm text-gray-500">Nenhuma categoria complemento encontrada.</p>}
        </div>
    );
};

export default ComplementCategorySelector;
