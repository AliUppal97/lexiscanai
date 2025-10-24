"use client"

import * as React from "react"
import { Calendar, X } from "lucide-react"
import { format, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subMonths, subWeeks } from "date-fns"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"

/**
 * DateRangePicker - Enterprise date range selection component
 * 
 * A powerful date range picker with preset ranges, custom selection,
 * and keyboard navigation. Perfect for analytics dashboards, reports,
 * and filtering.
 * 
 * Features:
 * - Quick preset ranges (Today, Last 7 days, etc.)
 * - Custom date selection
 * - Min/max date constraints
 * - Keyboard navigation
 * - Clear selection
 * - Formatted display
 * - Accessible (ARIA)
 * 
 * @example
 * const [dateRange, setDateRange] = useState<DateRange>({
 *   from: subDays(new Date(), 7),
 *   to: new Date()
 * })
 * 
 * <DateRangePicker
 *   value={dateRange}
 *   onChange={setDateRange}
 *   placeholder="Select date range"
 * />
 */

export interface DateRange {
  from: Date | undefined
  to: Date | undefined
}

export interface DateRangePreset {
  label: string
  value: DateRange
}

export interface DateRangePickerProps {
  value?: DateRange
  defaultValue?: DateRange
  onChange?: (range: DateRange | undefined) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  minDate?: Date
  maxDate?: Date
  presets?: DateRangePreset[]
  showPresets?: boolean
  allowClear?: boolean
  format?: string
  align?: "start" | "center" | "end"
}

// Default preset ranges
const defaultPresets: DateRangePreset[] = [
  {
    label: "Today",
    value: {
      from: new Date(),
      to: new Date(),
    },
  },
  {
    label: "Yesterday",
    value: {
      from: addDays(new Date(), -1),
      to: addDays(new Date(), -1),
    },
  },
  {
    label: "Last 7 days",
    value: {
      from: addDays(new Date(), -6),
      to: new Date(),
    },
  },
  {
    label: "Last 30 days",
    value: {
      from: addDays(new Date(), -29),
      to: new Date(),
    },
  },
  {
    label: "Last 90 days",
    value: {
      from: addDays(new Date(), -89),
      to: new Date(),
    },
  },
  {
    label: "This week",
    value: {
      from: startOfWeek(new Date()),
      to: endOfWeek(new Date()),
    },
  },
  {
    label: "Last week",
    value: {
      from: startOfWeek(subWeeks(new Date(), 1)),
      to: endOfWeek(subWeeks(new Date(), 1)),
    },
  },
  {
    label: "This month",
    value: {
      from: startOfMonth(new Date()),
      to: endOfMonth(new Date()),
    },
  },
  {
    label: "Last month",
    value: {
      from: startOfMonth(subMonths(new Date(), 1)),
      to: endOfMonth(subMonths(new Date(), 1)),
    },
  },
]

export function DateRangePicker({
  value: controlledValue,
  defaultValue,
  onChange,
  placeholder = "Select date range",
  className,
  disabled = false,
  minDate,
  maxDate,
  presets = defaultPresets,
  showPresets = true,
  allowClear = true,
  format: dateFormat = "MMM dd, yyyy",
  align = "start",
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [internalValue, setInternalValue] = React.useState<DateRange | undefined>(defaultValue)
  const [tempRange, setTempRange] = React.useState<DateRange | undefined>()
  const [hoverDate, setHoverDate] = React.useState<Date | undefined>()

  // Support both controlled and uncontrolled
  const isControlled = controlledValue !== undefined
  const value = isControlled ? controlledValue : internalValue

  const handleSelect = (date: Date) => {
    if (!tempRange?.from || (tempRange.from && tempRange.to)) {
      // Start new selection
      setTempRange({ from: date, to: undefined })
    } else if (tempRange.from && !tempRange.to) {
      // Complete selection
      const newRange: DateRange = {
        from: date < tempRange.from ? date : tempRange.from,
        to: date < tempRange.from ? tempRange.from : date,
      }
      
      setTempRange(undefined)
      setHoverDate(undefined)
      
      if (!isControlled) {
        setInternalValue(newRange)
      }
      onChange?.(newRange)
      setOpen(false)
    }
  }

  const handlePresetSelect = (preset: DateRange) => {
    setTempRange(undefined)
    setHoverDate(undefined)
    
    if (!isControlled) {
      setInternalValue(preset)
    }
    onChange?.(preset)
    setOpen(false)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    setTempRange(undefined)
    setHoverDate(undefined)
    
    if (!isControlled) {
      setInternalValue(undefined)
    }
    onChange?.(undefined)
  }

  const formatDateRange = (range: DateRange | undefined) => {
    if (!range?.from) return placeholder
    if (!range.to) return format(range.from, dateFormat)
    return `${format(range.from, dateFormat)} - ${format(range.to, dateFormat)}`
  }

  const displayRange = tempRange || value

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          <Calendar className="mr-2 h-4 w-4" />
          {formatDateRange(value)}
          {allowClear && value?.from && (
            <X
              className="ml-auto h-4 w-4 opacity-50 hover:opacity-100"
              onClick={handleClear}
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0"
        align={align}
      >
        <div className="flex">
          {/* Presets sidebar */}
          {showPresets && presets.length > 0 && (
            <>
              <div className="w-48 border-r p-3">
                <p className="mb-2 text-sm font-medium">Quick select</p>
                <div className="space-y-1">
                  {presets.map((preset, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-sm"
                      onClick={() => handlePresetSelect(preset.value)}
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
              </div>
              <Separator orientation="vertical" />
            </>
          )}

          {/* Calendar */}
          <div className="p-3">
            <SimpleDatePicker
              value={displayRange}
              onChange={handleSelect}
              onHoverDate={setHoverDate}
              hoverDate={hoverDate}
              minDate={minDate}
              maxDate={maxDate}
            />
            
            {tempRange?.from && !tempRange.to && (
              <div className="mt-3 text-xs text-muted-foreground text-center">
                Select end date
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

/**
 * SimpleDatePicker - Internal calendar component
 */

interface SimpleDatePickerProps {
  value?: DateRange
  onChange: (date: Date) => void
  onHoverDate?: (date: Date | undefined) => void
  hoverDate?: Date
  minDate?: Date
  maxDate?: Date
}

function SimpleDatePicker({
  value,
  onChange,
  onHoverDate,
  hoverDate,
  minDate,
  maxDate,
}: SimpleDatePickerProps) {
  const [currentMonth, setCurrentMonth] = React.useState(new Date())

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate()

  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay()

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i)

  const isDateInRange = (date: Date) => {
    if (!value?.from) return false
    if (!value.to && !hoverDate) return date.toDateString() === value.from.toDateString()
    
    const endDate = value.to || hoverDate
    if (!endDate) return false
    
    return date >= value.from && date <= endDate
  }

  const isDateDisabled = (date: Date) => {
    if (minDate && date < minDate) return true
    if (maxDate && date > maxDate) return true
    return false
  }

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  return (
    <div className="w-72">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="outline"
          size="icon"
          onClick={goToPreviousMonth}
        >
          <span className="sr-only">Previous month</span>
          ←
        </Button>
        <div className="text-sm font-medium">
          {format(currentMonth, "MMMM yyyy")}
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={goToNextMonth}
        >
          <span className="sr-only">Next month</span>
          →
        </Button>
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Day headers */}
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-muted-foreground py-2"
          >
            {day}
          </div>
        ))}

        {/* Blank cells */}
        {blanks.map((blank) => (
          <div key={`blank-${blank}`} />
        ))}

        {/* Day cells */}
        {days.map((day) => {
          const date = new Date(
            currentMonth.getFullYear(),
            currentMonth.getMonth(),
            day
          )
          const isToday = date.toDateString() === new Date().toDateString()
          const isSelected =
            date.toDateString() === value?.from?.toDateString() ||
            date.toDateString() === value?.to?.toDateString()
          const isInRange = isDateInRange(date)
          const isDisabled = isDateDisabled(date)

          return (
            <button
              key={day}
              type="button"
              onClick={() => !isDisabled && onChange(date)}
              onMouseEnter={() => onHoverDate?.(date)}
              onMouseLeave={() => onHoverDate?.(undefined)}
              disabled={isDisabled}
              className={cn(
                "h-9 w-full text-center text-sm rounded-md transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isToday && "border border-primary",
                isSelected && "bg-primary text-primary-foreground hover:bg-primary",
                isInRange &&
                  !isSelected &&
                  "bg-accent/50",
                isDisabled && "text-muted-foreground opacity-50 cursor-not-allowed"
              )}
            >
              {day}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/**
 * DateRangeInput - Text input version with date range picker
 * 
 * @example
 * <DateRangeInput
 *   value={dateRange}
 *   onChange={setDateRange}
 * />
 */

interface DateRangeInputProps extends Omit<DateRangePickerProps, "className"> {
  inputClassName?: string
}

export function DateRangeInput({
  inputClassName,
  ...props
}: DateRangeInputProps) {
  return (
    <DateRangePicker
      {...props}
      className={cn("w-full", inputClassName)}
    />
  )
}

