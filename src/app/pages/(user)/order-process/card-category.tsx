import Carousel from "@/app/components/carousel/carousel";
import Category, { CategoryMap } from "@/app/entities/category/category";
import CardProcessRule from "./card-process-rule";
import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import Refresh, { FormatRefreshTime } from "@/app/components/crud/refresh";
import { useQuery } from "@tanstack/react-query";
import { GetProcessRulesByCategoryID } from "@/app/api/process-rule/process-rule";

interface CardCategoryProps {
    category: CategoryMap;
}

const CardCategory = ({ category }: CardCategoryProps) => {
    const { data } = useSession();
    const [lastUpdate, setLastUpdate] = useState<string>(FormatRefreshTime(new Date()));
    const { isPending, data: processRulesResponse = [], refetch } = useQuery({
        queryKey: ['process-rules-with-processes', category.id],
        queryFn: async () => {
            setLastUpdate(FormatRefreshTime(new Date()));
            return GetProcessRulesByCategoryID(data!, category.id, true);
        },
        enabled: !!data?.user?.access_token,
        refetchInterval: 30000,
    });

    const processRules = useMemo(() => processRulesResponse || [], [processRulesResponse]);

    if (processRules.length === 0 || isPending) {
        return null;
    };

    return (
        <>
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold mb-2">{category.name}</h1>
                <Refresh
                    onRefresh={refetch}
                    isPending={isPending}
                    lastUpdate={lastUpdate}
                    optionalText="Processo"
                />
            </div>
            <Carousel items={processRules}>
                {(processRule) => <CardProcessRule key={processRule.id} processRule={processRule} />}
            </Carousel>
        </>
    )

}

export default CardCategory