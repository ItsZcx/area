import { useState } from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

interface DateTimePickerProps {
    label: string;
    placeholder: string;
    field: {
        value: Date | undefined;
        onChange: (date: Date | undefined) => void;
    }
}

export function DateTimePicker({ label, placeholder, field }: DateTimePickerProps) {
    const [isCalendarOpen, setIsCalendarOpen] = useState(false)

    const handleDateSelect = (date: Date | undefined) => {
        if (date) {
            const currentValue = field.value || new Date()
            const updatedDate = new Date(
                date.getFullYear(),
                date.getMonth(),
                date.getDate(),
                currentValue.getHours(),
                currentValue.getMinutes()
            )
            field.onChange(updatedDate)
        } else {
            field.onChange(undefined)
        }
    }

    const handleTimeChange = (type: "hour" | "minute", value: string) => {
        const currentValue = field.value || new Date()
        const updatedDate = new Date(currentValue)
        if (type === "hour") {
            updatedDate.setHours(parseInt(value))
        } else {
            updatedDate.setMinutes(parseInt(value))
        }
        field.onChange(updatedDate)
    }

    return (
        <FormItem className="flex flex-col">
            <FormLabel>{label}</FormLabel>
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                    <FormControl>
                        <Button
                            variant={"outline"}
                            className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                            )}
                        >
                            {field.value ? (
                                format(field.value, "PPP HH:mm")
                            ) : (
                                <span>{placeholder}</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                    </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={handleDateSelect}
                        disabled={(date) => date < new Date("1900-01-01")}
                        initialFocus
                    />
                    <div className="flex items-center justify-center p-3 border-t">
                        <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 opacity-50" />
                            <Select
                                onValueChange={(value) => handleTimeChange("hour", value)}
                                value={field.value ? field.value.getHours().toString() : undefined}
                            >
                                <SelectTrigger className="w-[70px]">
                                    <SelectValue placeholder="Hour" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Array.from({ length: 24 }, (_, i) => (
                                        <SelectItem key={i} value={i.toString()}>
                                            {i.toString().padStart(2, '0')}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <span>:</span>
                            <Select
                                onValueChange={(value) => handleTimeChange("minute", value)}
                                value={field.value ? field.value.getMinutes().toString() : undefined}
                            >
                                <SelectTrigger className="w-[70px]">
                                    <SelectValue placeholder="Minute" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Array.from({ length: 60 }, (_, i) => (
                                        <SelectItem key={i} value={i.toString()}>
                                            {i.toString().padStart(2, '0')}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
            <FormMessage />
        </FormItem>
    )
}
