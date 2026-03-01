import Carousel from "@/components/carousel/carousel";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Category from "@/app/entities/category/category";
import CardProcessRule from "./card-process-rule";
import React from "react";
import { LayoutGrid, AlertCircle, Settings2 } from "lucide-react";
import CardEditProcessRules from "./card-edit-process-rules";
import { Button } from "@/components/ui/button";
import { useUser } from "@/app/context/user-context";

interface CardCategoryProps {
    category: Category;
}

const CardCategory = ({ category }: CardCategoryProps) => {
    const { hasPermission } = useUser();
    // Agora os process_rules já vêm preenchidos da página principal
    const processRules = category.process_rules || [];

    return (
        <Card className="border-none shadow-md bg-white overflow-hidden transition-all duration-300 hover:shadow-lg group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 py-3 px-5 bg-gray-50/50 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-white rounded-md shadow-sm border border-gray-100 group-hover:scale-105 transition-transform duration-300">
                        <LayoutGrid className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                        <CardTitle className="text-lg font-black tracking-tight text-gray-800 leading-none">
                            {category.name}
                        </CardTitle>
                        <CardDescription className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                            {processRules.length} {processRules.length === 1 ? 'Fluxo' : 'Fluxos'}
                        </CardDescription>
                    </div>
                </div>

                {hasPermission('edit-order-process') && (
                    <CardEditProcessRules
                        category={category}
                        trigger={
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 rounded-lg text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-all duration-200"
                            >
                                <Settings2 className="w-4 h-4" />
                            </Button>
                        }
                    />
                )}
            </CardHeader>
            <CardContent className="pt-4 pb-4 px-4">
                {processRules.length === 0 ? (
                    <div className="flex items-center gap-2 p-3 rounded-xl border border-dashed border-gray-200 bg-gray-50/30 text-gray-500 italic text-xs">
                        <AlertCircle className="w-4 h-4 text-gray-400" />
                        Nenhuma regra de processo configurada.
                    </div>
                ) : (
                    <div className="animate-in fade-in zoom-in-95 duration-500">
                        <Carousel items={processRules}>
                            {(processRule) => (
                                <div className="px-1 py-0.5">
                                    <CardProcessRule key={processRule.id} processRule={processRule} />
                                </div>
                            )}
                        </Carousel>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

export default CardCategory;