import FormArray from "@/app/components/modal/form-array";
import Category from "@/app/entities/category/category";
import { Dispatch, SetStateAction } from "react";

export interface CategoryFormProps {
    item: Category;
    setItem: Dispatch<SetStateAction<Category>>;
}

const RemovableItensComponent = ({ item, setItem }: CategoryFormProps) => {
    const handleAddRemovableIngredients = () => {
        setItem(prev => ({
            ...prev,
            removable_ingredients: Array.isArray(prev.removable_ingredients) ? [...prev.removable_ingredients, ''] : ['']
        }));
    };

    const handleRemoveRemovableIngredients = (index: number) => {
        setItem(prev => ({
            ...prev,
            removable_ingredients: Array.isArray(prev.removable_ingredients) 
                ? prev.removable_ingredients.filter((_, i) => i !== index)
                : []
        }));
    };

    const handleRemovableIngredientsChange = (index: number, value: string) => {
        setItem(prev => {
            const updatedRemovableIngredients = [...prev.removable_ingredients];
            updatedRemovableIngredients[index] = value;
            return { ...prev, removable_ingredients: updatedRemovableIngredients };
        });
    };

    return (
        <FormArray
            title="Ingredientes removíveis"
            singleItemName="Ingrediente"
            items={item.removable_ingredients}
            onAdd={handleAddRemovableIngredients}
            onRemove={handleRemoveRemovableIngredients}
            onChange={handleRemovableIngredientsChange}
        />
    );
}

export default RemovableItensComponent;