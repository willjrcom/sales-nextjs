"use client"

import * as React from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

export interface MultiSelectOption {
    id: string
    name: string
    image_path?: string
}

interface MultiSelectProps {
    options: MultiSelectOption[]
    selected: MultiSelectOption[]
    onChange: (selected: MultiSelectOption[]) => void
    placeholder?: string
    emptyMessage?: string
    className?: string
}

export function MultiSelect({
    options,
    selected = [],
    onChange,
    placeholder = "Selecionar...",
    emptyMessage = "Nenhum item encontrado.",
    className,
}: MultiSelectProps) {
    const [open, setOpen] = React.useState(false)

    const handleSelect = (option: MultiSelectOption) => {
        const isSelected = selected.some((item) => item.id === option.id)
        if (isSelected) {
            onChange(selected.filter((item) => item.id !== option.id))
        } else {
            onChange([...selected, option])
        }
    }

    const handleRemove = (optionId: string) => {
        onChange(selected.filter((item) => item.id !== optionId))
    }

    return (
        <div className={cn("w-full", className)}>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between min-h-[40px] h-auto"
                    >
                        <div className="flex flex-wrap gap-1 flex-1">
                            {selected.length === 0 && (
                                <span className="text-muted-foreground">{placeholder}</span>
                            )}
                            {selected.map((item) => (
                                <Badge
                                    key={item.id}
                                    variant="secondary"
                                    className="mr-1 mb-1"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        handleRemove(item.id)
                                    }}
                                >
                                    {item.name}
                                    <span
                                        className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer inline-flex"
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" || e.key === " ") {
                                                e.preventDefault()
                                                handleRemove(item.id)
                                            }
                                        }}
                                        onMouseDown={(e) => {
                                            e.preventDefault()
                                            e.stopPropagation()
                                        }}
                                        onClick={(e) => {
                                            e.preventDefault()
                                            e.stopPropagation()
                                            handleRemove(item.id)
                                        }}
                                    >
                                        <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                                    </span>
                                </Badge>
                            ))}
                        </div>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                    <Command>
                        <CommandInput placeholder="Buscar..." />
                        <CommandEmpty>{emptyMessage}</CommandEmpty>
                        <CommandGroup className="max-h-64 overflow-auto">
                            {options.map((option) => {
                                const isSelected = selected.some((item) => item.id === option.id)
                                return (
                                    <CommandItem
                                        key={option.id}
                                        onSelect={() => handleSelect(option)}
                                        className="cursor-pointer"
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                isSelected ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        <span className="flex-1">{option.name}</span>
                                    </CommandItem>
                                )
                            })}
                        </CommandGroup>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    )
}
