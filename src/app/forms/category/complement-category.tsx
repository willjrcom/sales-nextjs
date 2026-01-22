import { Dispatch, SetStateAction, useMemo, useState, useEffect } from "react";
import Category from "@/app/entities/category/category";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { GetCategoriesComplement } from "@/app/api/category/category";
import Refresh, { FormatRefreshTime } from "@/app/components/crud/refresh";
import { MultiSelect } from "@/app/components/ui/multi-select";

interface CategorySelectorProps {
    selectedCategory: Category;
    setSelectedCategory: Dispatch<SetStateAction<Category>>;
}

const ComplementCategorySelector = ({ selectedCategory, setSelectedCategory }: CategorySelectorProps) => {
    const { data } = useSession();
    const [lastUpdate, setLastUpdate] = useState<string>(FormatRefreshTime(new Date()));
    const { isPending, data: complementCategoriesResponse, refetch } = useQuery({
        queryKey: ['complement-categories'],
        queryFn: async () => {
            setLastUpdate(FormatRefreshTime(new Date()));
            return GetCategoriesComplement(data!);
        },
        enabled: !!data?.user?.access_token,
        refetchInterval: 60000,
    });

    const [selectedCategories, setSelectedCategories] = useState<Category[]>(selectedCategory.complement_categories || []);

    useEffect(() => {
        setSelectedCategories(selectedCategory.complement_categories || []);
    }, [selectedCategory]);

    const handleCategorySelection = (categories: Category[]) => {
        setSelectedCategories(categories);
        setSelectedCategory(prev => ({
            ...prev,
            complement_categories: categories
        }));
    };

    const complementCategories = useMemo(() => complementCategoriesResponse || [], [complementCategoriesResponse]);

    return (
        <div className="w-full overflow-x-hidden">
            <div className="flex items-center justify-between mb-4 space-x-2">
                <h4 className="text-md font-medium">Categorias complemento</h4>
                <Refresh removeText
                    onRefresh={refetch}
                    isPending={isPending}
                    lastUpdate={lastUpdate}
                />
            </div>
            <MultiSelect
                options={complementCategories}
                selected={selectedCategories}
                onChange={(selected) => handleCategorySelection(selected as Category[])}
                placeholder="Selecione categorias complemento"
                emptyMessage="Nenhuma categoria complemento encontrada."
            />
        </div>
    );
};

export default ComplementCategorySelector;
