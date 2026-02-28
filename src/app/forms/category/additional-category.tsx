import { useState, useEffect, Dispatch, SetStateAction, useMemo } from "react";
import Category from "@/app/entities/category/category";
import { GetCategoriesAdditional } from "@/app/api/category/category";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import Refresh, { FormatRefreshTime } from "@/app/components/crud/refresh";
import { MultiSelect } from "@/app/components/ui/multi-select";

interface CategorySelectorProps {
    value: Category[];
    onChange: (categories: Category[]) => void;
}

const AdditionalCategorySelector = ({ value, onChange }: CategorySelectorProps) => {
    const { data } = useSession();
    const [lastUpdate, setLastUpdate] = useState<string>(FormatRefreshTime(new Date()));
    const { isFetching, data: additionalCategoriesResponse, refetch } = useQuery({
        queryKey: ['additional-categories'],
        queryFn: async () => {
            setLastUpdate(FormatRefreshTime(new Date()));
            return GetCategoriesAdditional((data as any)!);
        },
        enabled: !!data?.user?.access_token,
        refetchInterval: 60000,
    });

    const additionalCategories = useMemo(() => additionalCategoriesResponse || [], [additionalCategoriesResponse]);

    return (
        <div className="w-full overflow-x-hidden">
            <div className="flex items-center justify-between mb-4 space-x-2">
                <h4 className="text-md font-medium">Categorias adicionais</h4>
                <Refresh removeText
                    onRefresh={refetch}
                    isFetching={isFetching}
                    lastUpdate={lastUpdate}
                />
            </div>
            <MultiSelect
                options={additionalCategories}
                selected={value || []}
                onChange={(selected) => onChange(selected as Category[])}
                placeholder="Selecione categorias adicionais"
                emptyMessage="Nenhuma categoria adicional encontrada."
            />
        </div>
    );
};

export default AdditionalCategorySelector;
