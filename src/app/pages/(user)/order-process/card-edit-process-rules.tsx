import Category from "@/app/entities/category/category";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import ListProcessRule from "@/app/forms/category/list-process-rule";
import React from "react";

interface CardEditProcessRulesProps {
    category: Category;
    trigger?: React.ReactNode;
}

const CardEditProcessRules = ({ category, trigger }: CardEditProcessRulesProps) => {
    return (
        <Dialog>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" className="w-full font-bold text-xs uppercase tracking-widest h-9">
                        Gerenciar Regras de Processo
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Gerenciar Regras de Processos da Categoria {category.name}</DialogTitle>
                </DialogHeader>
                <ListProcessRule category={category} />
            </DialogContent>
        </Dialog>
    );
};

export default CardEditProcessRules;