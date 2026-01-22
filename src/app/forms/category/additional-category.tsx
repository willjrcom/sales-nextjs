import { useState, useEffect, Dispatch, SetStateAction, useMemo } from "react";
import Category from "@/app/entities/category/category";
import { FaTags } from 'react-icons/fa';
import { GetCategoriesAdditional } from "@/app/api/category/category";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import Refresh, { FormatRefreshTime } from "@/app/components/crud/refresh";
import { MultiSelect } from "@/app/components/ui/multi-select";

interface CategorySelectorProps {
    selectedCategory: Category;
    setSelectedCategory: Dispatch<SetStateAction<Category>>;
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

    const [selectedCategories, setSelectedCategories] = useState<Category[]>(selectedCategory.additional_categories || []);

    useEffect(() => {
        setSelectedCategories(selectedCategory.additional_categories || []);
    }, [selectedCategory]);

    const handleCategorySelection = (categories: Category[]) => {
        setSelectedCategories(categories);
        setSelectedCategory(prev => ({
            ...prev,
            additional_categories: categories
        }));
    };

    const additionalCategories = useMemo(() => additionalCategoriesResponse || [], [additionalCategoriesResponse]);

    return (
        <div className="w-full overflow-x-hidden">
            <div className="flex items-center justify-between mb-4 space-x-2">
                <h4 className="text-md font-medium">Categorias adicionais</h4>
                <Refresh removeText
                    onRefresh={refetch}
                    isPending={isPending}
                    lastUpdate={lastUpdate}
                />
            </div>
            <MultiSelect
                options={additionalCategories}
                selected={selectedCategories}
                onChange={(selected) => handleCategorySelection(selected as Category[])}
                placeholder="Selecione categorias adicionais"
                emptyMessage="Nenhuma categoria adicional encontrada."
            />
        </div>
    );
};

export default AdditionalCategorySelector;
