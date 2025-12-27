"use client";

import { Dispatch, SetStateAction } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface DateFieldProps {
    friendlyName: string;
    name: string;
    disabled?: boolean;
    value?: string | null | undefined;
    setValue: Dispatch<SetStateAction<string | null | undefined>>;
    optional?: boolean;
}

const DateField = ({ friendlyName, name, disabled, setValue, value, optional }: DateFieldProps) => {
    const date = value ? new Date(value) : undefined;

    const handleSelect = (selectedDate: Date | undefined) => {
        if (selectedDate) {
            setValue(selectedDate.toISOString());
        } else {
            setValue(null);
        }
    };

    return (
        <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={name}>
                {friendlyName} {!optional && <span className="text-red-500">*</span>}
            </label>

            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        id={name}
                        variant="outline"
                        disabled={disabled}
                        className={cn(
                            "w-full justify-start text-left font-normal",
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
                        onSelect={handleSelect}
                        initialFocus
                        locale={ptBR}
                        captionLayout="dropdown"
                        fromYear={1950}
                        toYear={2050}
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
};

export default DateField;