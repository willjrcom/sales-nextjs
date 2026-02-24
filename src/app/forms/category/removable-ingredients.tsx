import FormArray from "@/app/components/modal/form-array";
import Category from "@/app/entities/category/category";
import { Dispatch, SetStateAction } from "react";

export interface CategoryFormProps {
    value: string[];
    onChange: (ingredients: string[]) => void;
}

const RemovableItensComponent = ({ value, onChange }: CategoryFormProps) => {
    const handleAddRemovableIngredients = () => {
        onChange([...(value || []), '']);
    };

    const handleRemoveRemovableIngredients = (index: number) => {
        onChange((value || []).filter((_, i) => i !== index));
    };

    const handleRemovableIngredientsChange = (index: number, newValue: string) => {
        const updated = [...(value || [])];
        updated[index] = newValue;
        onChange(updated);
    };

    return (
        <FormArray
            title="Ingredientes removíveis"
            singleItemName="Ingrediente"
            items={value || []}
            onAdd={handleAddRemovableIngredients}
            onRemove={handleRemoveRemovableIngredients}
            onChange={handleRemovableIngredientsChange}
        />
    );
}

export default RemovableItensComponent;