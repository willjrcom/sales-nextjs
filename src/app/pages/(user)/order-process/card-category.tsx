import Carousel from "@/components/carousel/carousel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CategoryMap } from "@/app/entities/category/category";
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
        <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-2xl font-bold">{category.name}</CardTitle>
                <Refresh
                    onRefresh={refetch}
                    isPending={isPending}
                    lastUpdate={lastUpdate}
                    optionalText="Processo"
                />
            </CardHeader>
            <CardContent>
                <Carousel items={processRules}>
                    {(processRule) => <CardProcessRule key={processRule.id} processRule={processRule} />}
                </Carousel>
            </CardContent>
        </Card>
    )

}

export default CardCategory