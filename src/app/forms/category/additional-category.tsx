import { useState, useEffect } from "react";
import Category from "@/app/entities/category/category";
import Carousel from "@/app/components/carousel/carousel";

interface CategorySelectorProps {
    additionalCategories: Category[];
    selectedCategory: Category; // Categoria que possui o produto
    setSelectedCategory: React.Dispatch<React.SetStateAction<Category>>; // Função para atualizar a categoria
}

const AdditionalCategorySelector = ({ additionalCategories, selectedCategory, setSelectedCategory }: CategorySelectorProps) => {
    // Garantir que selectedCategories seja sempre um array
    const [selectedCategories, setSelectedCategories] = useState<Category[]>(selectedCategory.product_category_to_additional || []);

    useEffect(() => {
        // Sincronizar selectedCategories com product_category_to_additional quando selectedCategory mudar
        setSelectedCategories(selectedCategory.product_category_to_additional || []);
    }, [selectedCategory]);

    const handleCategorySelection = (category: Category) => {
        const isSelected = selectedCategories?.some(cat => cat.id === category.id);

        if (isSelected) {
            // Remover categoria selecionada
            setSelectedCategories(prev => prev.filter(cat => cat.id !== category.id));
            // Remover da lista de categories.product_category_to_additional
            setSelectedCategory(prev => ({
                ...prev,
                product_category_to_additional: prev.product_category_to_additional.filter(cat => cat.id !== category.id)
            }));
        } else {
            // Adicionar categoria
            setSelectedCategories(prev => [...(prev || []), category]);  // Garantir que prev é um array
            // Adicionar à lista de categories.product_category_to_additional
            setSelectedCategory(prev => ({
                ...prev,
                product_category_to_additional: [...(prev.product_category_to_additional || []), category] // Garantir que prev é um array
            }));
        }
    };

    const filteredCategories = additionalCategories.filter(cat => cat.is_additional)

    if (!filteredCategories.length) {
        return null;
    }

    return (
        <div>
            <h4 className="text-2xl font-medium mb-4">Categorias adicional</h4>
                <Carousel items={filteredCategories}>
                    {(category) => (
                    <div
                        key={category.id}
                        className={`border p-4 rounded-lg cursor-pointer ${selectedCategories?.some(cat => cat.id === category.id) ? 'bg-blue-100' : 'bg-white'}`}
                        onClick={() => handleCategorySelection(category)}
                    >
                        <img src={category.image_path} alt={category.name} className="w-full h-32 object-cover rounded-md mb-4" />
                        <h3 className="text-lg font-bold text-center">{category.name}</h3>
                    </div>
                    )}
                </Carousel>
        </div>
    );
};

export default AdditionalCategorySelector;
