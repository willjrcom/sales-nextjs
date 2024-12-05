import { useState } from "react";
import Category from "@/app/entities/category/category";
import Carousel from "@/app/components/carousel/carousel";

interface CategorySelectorProps {
    complementCategories: Category[];
    selectedCategory: Category; // Categoria que possui o produto
    setSelectedCategory: React.Dispatch<React.SetStateAction<Category>>; // Função para atualizar a categoria
}

const ComplementCategorySelector = ({ complementCategories, selectedCategory, setSelectedCategory }: CategorySelectorProps) => {
    const [selectedCategories, setSelectedCategories] = useState<Category[]>(selectedCategory.product_category_to_complement);

    const handleCategorySelection = (category: Category) => {
        const isSelected = selectedCategories?.some(cat => cat.id === category.id);

        if (isSelected) {
            // Remover categoria selecionada
            setSelectedCategories(prev => prev.filter(cat => cat.id !== category.id));
            // Remover da lista de categories.product_category_to_complement
            setSelectedCategory(prev => ({
                ...prev,
                product_category_to_complement: prev.product_category_to_complement.filter(cat => cat.id !== category.id)
            }));
        } else {
            // Adicionar categoria
            setSelectedCategories(prev => [...(prev || []), category]);  // Garantir que prev é um array
            // Adicionar à lista de categories.product_category_to_complement
            setSelectedCategory(prev => ({
                ...prev,
                product_category_to_complement: [...(prev.product_category_to_complement || []), category] // Garantir que prev é um array
            }));
        }
    };

    const filteredCategories = complementCategories.filter(cat => cat.is_complement)

    if (!filteredCategories.length) {
        return null;
    }

    return (
        <div>
            <h4 className="text-md font-medium mb-4">Categorias complemento</h4>
                <Carousel items={filteredCategories}>
                    {(category) => (
                    <div
                        key={category.id}
                        className={`border p-3 rounded-lg cursor-pointer ${selectedCategories?.some(cat => cat.id === category.id) ? 'bg-blue-100' : 'bg-white'}`}
                        onClick={() => handleCategorySelection(category)}
                    >
                        <img src={category.image_path} alt={category.name} className="w-full h-32 object-cover rounded-md mb-4" />
                        <h3 className="text-md font-bold text-center">{category.name}</h3>
                    </div>
                    )}
                </Carousel>
        </div>
    );
};

export default ComplementCategorySelector;
