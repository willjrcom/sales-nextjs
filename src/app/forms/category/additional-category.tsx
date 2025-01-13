import { useState, useEffect } from "react";
import Category from "@/app/entities/category/category";
import Carousel from "@/app/components/carousel/carousel";
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
                    {(category) => (
                    <div
                        key={category.id}
                        className={`border p-3 rounded-lg cursor-pointer ${selectedCategories?.some(cat => cat.id === category.id) ? 'bg-blue-100' : 'bg-white'}`}
                        onClick={() => handleCategorySelection(category)}
                    >
                        {category.image_path && <Image src={category.image_path} alt={category.name} className="w-full h-32 object-cover rounded-md mb-4" />}
                        <h3 className="text-md font-bold text-center">{category.name}</h3>
                    </div>
                    )}
                </Carousel>
                {filteredCategories.length === 0 && <p className="text-sm text-gray-500">Nenhuma categoria adicional encontrada.</p>}
        </div>
    );
};

export default AdditionalCategorySelector;
