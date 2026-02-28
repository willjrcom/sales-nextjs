'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Image from 'next/image';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useSession } from 'next-auth/react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { GetProcessRulesByCategoryID, ReorderProcessRules } from '@/app/api/process-rule/process-rule';
import ProcessRuleForm from '@/app/forms/process-rule/form';
import { Button } from '@/components/ui/button';
import { ChevronRight, GripVertical, Settings2, ChefHat, Clock, AlertCircle } from 'lucide-react';
import { notifySuccess, notifyError } from '@/app/utils/notifications';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Category from '@/app/entities/category/category';
import ProcessRule from '@/app/entities/process-rule/process-rule';
import ButtonIconTextFloat from '@/app/components/button/button-float';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ListProcessRuleProps {
    category: Category;
}

interface SortableItemProps {
    id: string;
    rule: ProcessRule;
    category: Category;
    onEdit?: () => void;
}

const SortableItem = ({ id, rule, category }: SortableItemProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "group relative bg-white border border-gray-100 rounded-xl p-4 mb-3 transition-all duration-200",
                "hover:border-blue-500/30 hover:bg-gray-50 shadow-sm",
                isDragging && "z-50 opacity-50 scale-[1.02] border-blue-500 bg-gray-50 shadow-2xl"
            )}
        >
            <div className="flex items-center gap-4">
                {/* Drag Handle */}
                <div
                    {...attributes}
                    {...listeners}
                    className="cursor-grab active:cursor-grabbing p-1 text-gray-300 group-hover:text-gray-400 transition-colors"
                >
                    <GripVertical size={20} />
                </div>

                {/* Icon/Avatar */}
                <div className="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                    {rule.image_path ? (
                        <Image
                            src={rule.image_path}
                            alt={rule.name}
                            width={48}
                            height={48}
                            className="rounded-lg h-full w-full object-cover"
                        />
                    ) : (
                        <ChefHat size={24} />
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900 truncate">{rule.name}</h4>
                        {!rule.is_active && (
                            <Badge variant="secondary" className="bg-red-500/10 text-red-500 border-red-500/20 text-[10px] h-4">
                                Inativo
                            </Badge>
                        )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                            <Clock size={12} />
                            <span>{rule.ideal_time || '00:00'}</span>
                        </div>
                        <span className="h-1 w-1 rounded-full bg-gray-200" />
                        <span className="truncate">ORDEM: {rule.order}</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
                            >
                                <Settings2 size={18} />
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Editar Etapa: {rule.name}</DialogTitle>
                            </DialogHeader>
                            <ProcessRuleForm item={rule} isUpdate category={category} onSuccess={() => setIsOpen(false)} />
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default function ListProcessRule({ category }: ListProcessRuleProps) {
    const { data: session } = useSession();
    const queryClient = useQueryClient();
    const [items, setItems] = useState<ProcessRule[]>([]);

    const { data: processRules, isFetching } = useQuery({
        queryKey: ['process-rules', 'by-category', category.id],
        queryFn: () => GetProcessRulesByCategoryID(session!, category.id),
        enabled: !!session?.user?.access_token && !!category.id,
    });

    useEffect(() => {
        if (processRules) {
            setItems(processRules.sort((a, b) => a.order - b.order));
        }
    }, [processRules]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = items.findIndex((item) => item.id === active.id);
            const newIndex = items.findIndex((item) => item.id === over.id);

            const newItems = arrayMove(items, oldIndex, newIndex);

            // Update orders sequentially
            const reorderedItems = newItems.map((item, index) => ({
                ...item,
                order: index + 1
            }));

            setItems(reorderedItems);

            try {
                await ReorderProcessRules(session!, reorderedItems.map(item => ({
                    id: item.id!,
                    order: item.order
                })));
                notifySuccess('Ordem atualizada com sucesso');
                queryClient.invalidateQueries({ queryKey: ['process-rules'] });
            } catch (error) {
                notifyError('Erro ao salvar nova ordem');
                setItems(items); // Rollback
            }
        }
    };

    if (isFetching) {
        return (
            <div className="flex flex-col items-center justify-center p-12 space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
                <p className="text-sm text-gray-500">Carregando etapas...</p>
            </div>
        );
    }

    return (
        <div className="relative min-h-[400px]">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-1">Fluxo de Preparo</h2>
                    <p className="text-sm text-gray-500">Arraste para redefinir a sequência dos processos.</p>
                </div>

                <ButtonIconTextFloat modalName="new-process-rule" title="Nova Etapa" position="bottom-right-1">
                    <ProcessRuleForm category={category} />
                </ButtonIconTextFloat>
            </div>

            {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/50">
                    <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-300 mb-4">
                        <AlertCircle size={32} />
                    </div>
                    <p className="text-gray-700 font-medium">Nenhuma etapa definida</p>
                    <p className="text-gray-400 text-sm">Comece adicionando o primeiro processo do fluxo.</p>
                </div>
            ) : (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={items.map(item => item.id!)}
                        strategy={verticalListSortingStrategy}
                    >
                        <div className="pr-2">
                            {items.map((rule) => (
                                <SortableItem
                                    key={rule.id}
                                    id={rule.id!}
                                    rule={rule}
                                    category={category}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            )}

            <div className="mt-8 p-4 rounded-xl bg-blue-50 border border-blue-100 flex items-start gap-3">
                <AlertCircle className="text-blue-600 mt-0.5" size={18} />
                <p className="text-xs text-blue-700 leading-relaxed">
                    <strong>Dica Premium:</strong> A ordem definida aqui impacta diretamente na visualização dos operadores de cozinha e no cálculo de tempo ideal de cada categoria.
                </p>
            </div>
        </div>
    );
}