"use client"

import * as React from "react"
import { Calendar as CalendarIcon } from "lucide-react"
import { addDays, format, isValid } from "date-fns"
import type { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DateRangePickerProps extends React.HTMLAttributes<HTMLDivElement> {
  date: DateRange | undefined;
  onDateChange: (date: DateRange | undefined) => void;
}

export function DateRangePicker({
  className,
  date,
  onDateChange,
}: DateRangePickerProps) {

  const handleSelect = (selectedDate: DateRange | undefined) => {
    onDateChange(selectedDate);
  };
  
  const formatDateSafe = (dateInput: Date | undefined, formatString: string = "LLL dd, y") => {
    if (!dateInput || !isValid(dateInput)) return "";
    try {
      return format(dateInput, formatString);
    } catch (error) {
      console.error("Error formatting date:", error, dateInput);
      return "Invalid Date";
    }
  };


  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full sm:w-[300px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {formatDateSafe(date.from)} - {formatDateSafe(date.to)}
                </>
              ) : (
                formatDateSafe(date.from)
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleSelect}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
