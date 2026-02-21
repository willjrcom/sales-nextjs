import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import CreateFormsProps from '../create-forms-props';
import RequestError from '@/app/utils/error';
import GroupItem from '@/app/entities/order/group-item';
import { DateTimeField, TextField } from '@/app/components/modal/field';
import ScheduleGroupItem from '@/app/api/group-item/update/schedule/group-item';
import { FaCalendarAlt, FaSave, FaTrash, FaComment } from 'react-icons/fa';
import { notifySuccess, notifyError } from '@/app/utils/notifications';
import ObservationGroupItem from '@/app/api/group-item/update/observation/group-item';
import { useQueryClient } from '@tanstack/react-query';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface GroupItemFormProps extends CreateFormsProps<GroupItem> {
    onSuccess?: () => void;
}

const GroupItemForm = ({ item, onSuccess }: GroupItemFormProps) => {
    const [groupItem, setGroupItem] = useState<GroupItem>(new GroupItem(item));
    const [observation, setObservation] = useState<string>(item?.observation || '');
    const [startAt, setStartAt] = useState<string | null | undefined>(item?.start_at);
    const [observationOpen, setObservationOpen] = useState(false);
    const [scheduleOpen, setScheduleOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const { data } = useSession();
    const queryClient = useQueryClient();

    const onSaveSchedule = async (newStartAt: string | null | undefined) => {
        if (!data) return;
        if (newStartAt === null) newStartAt = "";

        setIsProcessing(true);
        try {
            const prev = groupItem.start_at;
            await ScheduleGroupItem(groupItem, data, newStartAt);
            setGroupItem({ ...groupItem, start_at: newStartAt });
            setStartAt(newStartAt);
            queryClient.invalidateQueries({ queryKey: ['group-item', 'current'] });

            // Notificação de sucesso conforme ação
            let msg = '';
            if ((!prev || prev === '') && newStartAt) msg = 'Agendamento criado com sucesso';
            else if (prev && newStartAt) msg = 'Agendamento atualizado com sucesso';
            else if (prev && !newStartAt) msg = 'Agendamento removido com sucesso';
            else msg = 'Agendamento processado com sucesso';
            notifySuccess(msg);
        } catch (error) {
            const err = error as RequestError;
            notifyError(err.message || 'Erro ao agendar');
        } finally {
            setIsProcessing(false);
        }
    };

    const onSaveObservation = async (observation: string) => {
        if (!data) return;
        if (observation === null) observation = "";

        setIsProcessing(true);
        try {
            const prev = groupItem.observation;
            await ObservationGroupItem(groupItem, data, observation);
            setGroupItem({ ...groupItem, observation: observation });
            setObservation(observation);
            queryClient.invalidateQueries({ queryKey: ['group-item', 'current'] });
            setObservationOpen(false);

            // Notificação de sucesso conforme ação
            let msg = '';
            if ((!prev || prev === '') && observation) msg = 'Observação adicionada com sucesso';
            else if (prev && observation) msg = 'Observação atualizada com sucesso';
            else if (prev && !observation) msg = 'Observação removida com sucesso';
            else msg = 'Observação processada com sucesso';
            notifySuccess(msg);
        } catch (error) {
            const err = error as RequestError;
            notifyError(err.message || 'Erro ao alterar observação');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSaveSchedule = async () => {
        await onSaveSchedule(startAt);
        setScheduleOpen(false);
    };

    const handleRemoveSchedule = async () => {
        await onSaveSchedule(null);
        setScheduleOpen(false);
    };

    const handleScheduleDialogOpen = (open: boolean) => {
        if (open && !groupItem.start_at) {
            // Se não tem agendamento, inicia com a data de hoje (sem hora definida)
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            setStartAt(today.toISOString());
        }
        setScheduleOpen(open);
    };

    return (
        <div className="flex gap-2 flex-wrap">
            {/* Botão Observação */}
            <Dialog open={observationOpen} onOpenChange={setObservationOpen}>
                <DialogTrigger asChild>
                    <Button
                        variant="outline"
                        className={`gap-2 ${groupItem.observation ? 'border-blue-500 text-blue-600' : ''}`}
                    >
                        <FaComment className="h-4 w-4" />
                        Observação
                        {groupItem.observation && <span className="w-2 h-2 bg-blue-500 rounded-full" />}
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Observação</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <TextField
                            name='Observation'
                            setValue={setObservation}
                            value={observation}
                            friendlyName='Observação'
                            placeholder='Digite a observação'
                        />
                    </div>
                    <DialogFooter className="gap-2">
                        <DialogClose asChild>
                            <Button variant="outline">Cancelar</Button>
                        </DialogClose>
                        <Button onClick={() => onSaveObservation(observation)} disabled={isProcessing}>
                            <FaSave className="mr-2 h-4 w-4" />
                            {isProcessing ? 'Salvando...' : 'Salvar'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Botão Agendamento */}
            <Dialog open={scheduleOpen} onOpenChange={handleScheduleDialogOpen}>
                <DialogTrigger asChild>
                    <Button
                        variant="outline"
                        className={`gap-2 ${groupItem.start_at ? 'border-purple-500 text-purple-600' : ''}`}
                    >
                        <FaCalendarAlt className="h-4 w-4" />
                        Agendar
                        {groupItem.start_at && <span className="w-2 h-2 bg-purple-500 rounded-full" />}
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Agendamento</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <DateTimeField
                            friendlyName="Data e Hora"
                            name="schedule"
                            value={startAt}
                            setValue={setStartAt}
                        />
                    </div>
                    <DialogFooter className="gap-2">
                        {groupItem.start_at && (
                            <Button variant="destructive" onClick={handleRemoveSchedule} disabled={isProcessing}>
                                <FaTrash className="mr-2 h-4 w-4" />
                                {isProcessing ? 'Removendo...' : 'Remover'}
                            </Button>
                        )}
                        <DialogClose asChild>
                            <Button variant="outline">Cancelar</Button>
                        </DialogClose>
                        <Button onClick={handleSaveSchedule} disabled={isProcessing}>
                            <FaSave className="mr-2 h-4 w-4" />
                            {isProcessing ? 'Salvando...' : 'Salvar'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default GroupItemForm;
