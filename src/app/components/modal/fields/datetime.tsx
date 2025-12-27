"use client";

import { Dispatch, SetStateAction } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface DateTimeFieldProps {
    friendlyName: string;
    name: string;
    disabled?: boolean;
    value: string | null | undefined;
    setValue: Dispatch<SetStateAction<string | null | undefined>>;
    optional?: boolean;
}

const DateTimeField = ({ friendlyName, name, disabled, setValue, value, optional }: DateTimeFieldProps) => {
    const date = value ? new Date(value) : undefined;
    const timeValue = date ? format(date, "HH:mm") : "";

    const handleDateSelect = (selectedDate: Date | undefined) => {
        if (selectedDate) {
            // Preserva a hora atual se existir
            if (date) {
                selectedDate.setHours(date.getHours(), date.getMinutes());
            }
            setValue(selectedDate.toISOString());
        } else {
            setValue(null);
        }
    };

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const [hours, minutes] = e.target.value.split(':').map(Number);
        const newDate = date ? new Date(date) : new Date();
        newDate.setHours(hours || 0, minutes || 0, 0, 0);
        setValue(newDate.toISOString());
    };

    return (
        <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={name}>
                {friendlyName} {!optional && <span className="text-red-500">*</span>}
            </label>

            <div className="flex gap-2">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            id={name}
                            variant="outline"
                            disabled={disabled}
                            className={cn(
                                "flex-1 justify-start text-left font-normal",
                                !date && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, "PPP", { locale: ptBR }) : <span>Selecione uma data</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={handleDateSelect}
                            initialFocus
                            locale={ptBR}
                            captionLayout="dropdown"
                            fromYear={1950}
                            toYear={2050}
                        />
                    </PopoverContent>
                </Popover>

                <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="time"
                        disabled={disabled}
                        value={timeValue}
                        onChange={handleTimeChange}
                        className="h-10 pl-10 pr-3 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    />
                </div>
            </div>
        </div>
    );
};

export default DateTimeField;
