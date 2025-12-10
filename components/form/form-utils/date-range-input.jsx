"use client";
import { useState } from "react";
import { format, isValid } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CalendarIcon, X } from "lucide-react";
import {
  FormProvider,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const CustomFormDescription = ({ children }) => {
  return (
    <div className="text-sm text-muted-foreground">
      {children}
    </div>
  );
};

export const DateRangeInput = ({
  control,
  form,
  name,
  label,
  description,
  placeholder = "Select date range",
  required,
  disabled,
  className,
  labelClassName,
  buttonClassName,
  calendarClassName,
  minDate,
  maxDate,
  disabledDates,
  disabledDays,
  onValueChange,
  validateDateRange,
  clearErrors,
  descriptionComponent,
  allowClear = true,
  showBadge = true,
  Icon = CalendarIcon,
  transform = {
    input: (value) => (value ? {
      from: value.from ? new Date(value.from) : undefined,
      to: value.to ? new Date(value.to) : undefined
    } : { from: undefined, to: undefined }),
    output: (range) => ({
      from: range?.from ? range.from.toISOString() : undefined,
      to: range?.to ? range.to.toISOString() : undefined
    }),
  },
}) => {
  // If neither control nor form is provided, we'll use local state
  const [localDateRange, setLocalDateRange] = useState({ from: undefined, to: undefined });

  const formatDateRange = (range) => {
    if (!range || (!range.from && !range.to)) return "";
    const fromFormatted = range.from ? format(range.from, "MMM d") : "";
    const toFormatted = range.to ? format(range.to, "MMM d") : "";
    
    if (fromFormatted && toFormatted) {
      return `${fromFormatted} - ${toFormatted}`;
    } else if (fromFormatted) {
      return `From ${fromFormatted}`;
    } else if (toFormatted) {
      return `Until ${toFormatted}`;
    }
    
    return "";
  };

  const isDateDisabled = (date) => {
    if (!date || !isValid(date)) return true;
    if (disabled) return true;
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    if (disabledDates?.includes(date)) return true;
    if (disabledDays?.includes(date.getDay())) return true;
    return false;
  };

  const handleDateRangeSelect = (range, field) => {
    if (disabled) return;

    // Ensure range is defined with default values
    const safeRange = range || { from: undefined, to: undefined };

    // If validation function exists, check if date range is valid
    if (validateDateRange && !validateDateRange(safeRange)) {
      return;
    }

    if (field) {
      const transformedValue = transform.output(safeRange);
      field.onChange(transformedValue);
    } else {
      setLocalDateRange(safeRange);
    }
    
    onValueChange?.(safeRange);

    // Clear errors if specified
    if (clearErrors && name) {
      clearErrors(name);
    }
  };

  const handleClear = (field, e) => {
    e.stopPropagation(); // Prevent popover from opening
    
    if (field) {
      field.onChange({ from: undefined, to: undefined });
    } else {
      setLocalDateRange({ from: undefined, to: undefined });
    }
    
    onValueChange?.({ from: undefined, to: undefined });
    
    if (clearErrors && name) {
      clearErrors(name);
    }
  };

  // If we have react-hook-form setup
  if (control && name) {
    return (
      <FormField
        control={control}
        name={name}
        render={({ field }) => {
          // Transform field value to Date objects for the Calendar
          const dateRange = transform.input(field.value);
          
          return (
            <FormItem className={cn("w-full", className)}>
              {label && (
                <div className="flex items-center gap-2 mb-2">
                  <FormLabel className={cn("flex-grow", labelClassName)}>
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                  </FormLabel>
                  {Icon && <span className="text-gray-500 flex-shrink-0"><Icon className="h-4 w-4" /></span>}
                </div>
              )}
              
              <FormControl>
                <DateRangePopover
                  dateRange={dateRange}
                  placeholder={placeholder}
                  disabled={disabled}
                  buttonClassName={buttonClassName}
                  calendarClassName={calendarClassName}
                  allowClear={allowClear}
                  showBadge={showBadge}
                  Icon={Icon}
                  formatDateRange={formatDateRange}
                  isDateDisabled={isDateDisabled}
                  handleDateRangeSelect={(range) => handleDateRangeSelect(range, field)}
                  handleClear={(e) => handleClear(field, e)}
                  minDate={minDate}
                  maxDate={maxDate}
                />
              </FormControl>

              {description && !descriptionComponent && (
                <FormDescription>{description}</FormDescription>
              )}
              
              {descriptionComponent && (
                <CustomFormDescription>
                  {descriptionComponent}
                </CustomFormDescription>
              )}
              
              <FormMessage />
            </FormItem>
          );
        }}
      />
    );
  }
  
  // Standalone component without form context
  return (
    <div className={cn("w-full", className)}>
      {label && (
        <div className="flex items-center gap-2 mb-2">
          <div className={cn("text-sm font-medium flex-grow", labelClassName)}>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </div>
          {Icon && <span className="text-gray-500 flex-shrink-0"><Icon className="h-4 w-4" /></span>}
        </div>
      )}
      
      <DateRangePopover
        dateRange={localDateRange}
        placeholder={placeholder}
        disabled={disabled}
        buttonClassName={buttonClassName}
        calendarClassName={calendarClassName}
        allowClear={allowClear}
        showBadge={showBadge}
        Icon={Icon}
        formatDateRange={formatDateRange}
        isDateDisabled={isDateDisabled}
        handleDateRangeSelect={(range) => handleDateRangeSelect(range)}
        handleClear={(e) => handleClear(null, e)}
        minDate={minDate}
        maxDate={maxDate}
      />
      
      {description && (
        <div className="text-sm text-muted-foreground mt-1">
          {description}
        </div>
      )}
      
      {descriptionComponent && (
        <CustomFormDescription>
          {descriptionComponent}
        </CustomFormDescription>
      )}
    </div>
  );
};

// Extract Popover component for reuse
const DateRangePopover = ({
  dateRange,
  placeholder,
  disabled,
  buttonClassName,
  calendarClassName,
  allowClear,
  showBadge,
  Icon,
  formatDateRange,
  isDateDisabled,
  handleDateRangeSelect,
  handleClear,
  minDate,
  maxDate,
}) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="relative">
          <Button
            variant={(dateRange?.from || dateRange?.to) ? "outline" : "secondary"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !(dateRange?.from || dateRange?.to) && "text-muted-foreground",
              disabled && "cursor-not-allowed opacity-50",
              (dateRange?.from || dateRange?.to) && allowClear && "pr-8",
              buttonClassName
            )}
            disabled={disabled}
            type="button"
          >
            <Icon className="mr-2 h-4 w-4" />
            {(dateRange?.from || dateRange?.to) ? (
              <span>
                {formatDateRange(dateRange)}
                {showBadge && (dateRange?.from && dateRange?.to) && (
                  <span className="ml-2 text-xs bg-secondary text-secondary-foreground py-0.5 px-2 rounded-full">
                    {formatDateRange(dateRange)}
                  </span>
                )}
              </span>
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
          {(dateRange?.from || dateRange?.to) && allowClear && !disabled && (
            <Button
              type="button"
              variant="ghost"
              className="absolute right-0 top-0 h-full px-2 hover:bg-transparent"
              onClick={handleClear}
            >
              <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              <span className="sr-only">Clear date range</span>
            </Button>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent 
        className={cn("w-auto p-0", calendarClassName)} 
        align="start"
      >
        <Calendar
          mode="range"
          selected={dateRange}
          onSelect={handleDateRangeSelect}
          disabled={isDateDisabled}
          initialFocus
          {...(minDate && { fromDate: minDate })}
          {...(maxDate && { toDate: maxDate })}
        />
        <div className="p-3 border-t border-border">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleClear}
            disabled={!(dateRange?.from || dateRange?.to)}
            className="w-full"
          >
            Clear Date Range
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

