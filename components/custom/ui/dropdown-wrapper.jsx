"use client";

import * as React from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
    DropdownMenuGroup,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuCheckboxItem,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function DropdownWrapper({
    trigger,
    children,
    align = "end",
    side = "bottom",
    sideOffset = 4,
    className,
    contentClassName,
    ...props
}) {
    const TriggerComponent = React.forwardRef(
        ({ children: triggerChildren, ...triggerProps }, ref) => (
            <DropdownMenuTrigger ref={ref} asChild {...triggerProps}>
                {triggerChildren}
            </DropdownMenuTrigger>
        )
    );
    TriggerComponent.displayName = "DropdownWrapperTrigger";

    const renderedTrigger =
        typeof trigger === "function"
            ? trigger({ Trigger: TriggerComponent })
            : (
                <DropdownMenuTrigger asChild>
                    {trigger}
                </DropdownMenuTrigger>
            );

    return (
        <DropdownMenu {...props}>
            {renderedTrigger}
            <DropdownMenuContent
                align={align}
                side={side}
                sideOffset={sideOffset}
                className={cn("min-w-[160px]", contentClassName)}
            >
                {children}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

// Convenience component for action dropdowns (like the 3-dot menu)
export function ActionDropdown({
    items = [],
    triggerIcon: TriggerIcon = MoreHorizontal,
    triggerVariant = "ghost",
    triggerSize = "sm",
    triggerClassName,
    triggerLabel,
    showOnHover = false,
    align = "end",
    contentClassName,
    onOpenChange,
    stopPropagation = true,
    ...props
}) {
    const handleTriggerClick = (e) => {
        if (stopPropagation) {
            e.stopPropagation();
        }
    };

    const trigger = (
        <Button
            variant={triggerVariant}
            size={triggerSize}
            onClick={handleTriggerClick}
            className={cn(
                showOnHover && "opacity-0 group-hover:opacity-100 transition-opacity",
                triggerClassName
            )}
        >
            <TriggerIcon className="h-4 w-4" />
            {triggerLabel && <span className="ml-2">{triggerLabel}</span>}
            <span className="sr-only">Open menu</span>
        </Button>
    );

    const handleItemClick = (item) => (e) => {
        if (stopPropagation) {
            e.stopPropagation();
        }
        item.onClick?.(e);
    };

    return (
        <DropdownWrapper
            trigger={trigger}
            align={align}
            contentClassName={cn("min-w-[180px]", contentClassName)}
            onOpenChange={onOpenChange}
            {...props}
        >
            {items.map((item, index) => {
                // Don't render if hidden
                if (item.hidden) {
                    return null;
                }

                if (item.type === "separator") {
                    return <DropdownMenuSeparator key={item.key || `separator-${index}`} />;
                }
                
                if (item.type === "label") {
                    return (
                        <DropdownMenuLabel key={item.key || `label-${index}`} className={item.className}>
                            {item.label}
                        </DropdownMenuLabel>
                    );
                }

                if (item.type === "group") {
                    return (
                        <DropdownMenuGroup key={item.key || `group-${index}`}>
                            {item.items?.map((groupItem, groupIndex) => {
                                if (groupItem.hidden) return null;
                                
                                const GroupItemIcon = groupItem.icon;
                                return (
                                    <DropdownMenuItem
                                        key={groupItem.key || `group-item-${groupIndex}`}
                                        onClick={handleItemClick(groupItem)}
                                        disabled={groupItem.disabled}
                                        className={cn(
                                            groupItem.variant === "destructive" && "text-destructive focus:text-destructive",
                                            groupItem.className
                                        )}
                                    >
                                        {GroupItemIcon && <GroupItemIcon className="h-4 w-4" />}
                                        <span>{groupItem.label}</span>
                                        {groupItem.shortcut && (
                                            <span className="ml-auto text-xs tracking-widest text-muted-foreground">
                                                {groupItem.shortcut}
                                            </span>
                                        )}
                                    </DropdownMenuItem>
                                );
                            })}
                        </DropdownMenuGroup>
                    );
                }

                // Regular menu item
                const ItemIcon = item.icon;
                const displayLabel = typeof item.label === "function" ? item.label() : item.label;

                return (
                    <DropdownMenuItem
                        key={item.key || `item-${index}`}
                        onClick={handleItemClick(item)}
                        disabled={item.disabled}
                        className={cn(
                            item.variant === "destructive" && "text-destructive focus:text-destructive",
                            item.className
                        )}
                    >
                        {ItemIcon && <ItemIcon className="h-4 w-4" />}
                        <span>{displayLabel}</span>
                        {item.shortcut && (
                            <span className="ml-auto text-xs tracking-widest text-muted-foreground">
                                {item.shortcut}
                            </span>
                        )}
                    </DropdownMenuItem>
                );
            })}
        </DropdownWrapper>
    );
}

// Convenience component for select-style dropdowns
export function SelectDropdown({
    value,
    onValueChange,
    placeholder = "Select option...",
    options = [],
    triggerClassName,
    contentClassName,
    disabled = false,
    ...props
}) {
    const selectedOption = options.find(option => option.value === value);

    const trigger = (
        <Button
            variant="outline"
            disabled={disabled}
            className={cn(
                "w-full justify-between",
                !selectedOption && "text-muted-foreground",
                triggerClassName
            )}
        >
            {selectedOption ? selectedOption.label : placeholder}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
    );

    return (
        <DropdownWrapper
            trigger={trigger}
            align="start"
            contentClassName={cn("w-full min-w-[var(--radix-dropdown-menu-trigger-width)]", contentClassName)}
            {...props}
        >
            {options.map((option) => (
                <DropdownMenuItem
                    key={option.value}
                    onClick={() => onValueChange?.(option.value)}
                    className={cn(
                        "cursor-pointer",
                        value === option.value && "bg-accent"
                    )}
                >
                    {option.icon && (
                        <option.icon className="mr-2 h-4 w-4" />
                    )}
                    {option.label}
                </DropdownMenuItem>
            ))}
        </DropdownWrapper>
    );
}

// Convenience component for checkbox dropdowns (multi-select)
export function CheckboxDropdown({
    values = [],
    onValuesChange,
    placeholder = "Select options...",
    options = [],
    triggerClassName,
    contentClassName,
    disabled = false,
    showSelectedCount = true,
    ...props
}) {
    const selectedOptions = options.filter(option => values.includes(option.value));
    const displayText = selectedOptions.length > 0 
        ? showSelectedCount 
            ? `${selectedOptions.length} selected`
            : selectedOptions.map(opt => opt.label).join(", ")
        : placeholder;

    const trigger = (
        <Button
            variant="outline"
            disabled={disabled}
            className={cn(
                "w-full justify-between",
                selectedOptions.length === 0 && "text-muted-foreground",
                triggerClassName
            )}
        >
            <span className="truncate">{displayText}</span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
    );

    const handleCheckedChange = (optionValue, checked) => {
        if (checked) {
            onValuesChange?.([...values, optionValue]);
        } else {
            onValuesChange?.(values.filter(value => value !== optionValue));
        }
    };

    return (
        <DropdownWrapper
            trigger={trigger}
            align="start"
            contentClassName={cn("w-full min-w-[var(--radix-dropdown-menu-trigger-width)]", contentClassName)}
            {...props}
        >
            {options.map((option) => (
                <DropdownMenuCheckboxItem
                    key={option.value}
                    checked={values.includes(option.value)}
                    onCheckedChange={(checked) => handleCheckedChange(option.value, checked)}
                >
                    {option.icon && (
                        <option.icon className="mr-2 h-4 w-4" />
                    )}
                    {option.label}
                </DropdownMenuCheckboxItem>
            ))}
        </DropdownWrapper>
    );
}

// Convenience component for radio dropdowns (single select with radio buttons)
export function RadioDropdown({
    value,
    onValueChange,
    placeholder = "Select option...",
    options = [],
    triggerClassName,
    contentClassName,
    disabled = false,
    ...props
}) {
    const selectedOption = options.find(option => option.value === value);

    const trigger = (
        <Button
            variant="outline"
            disabled={disabled}
            className={cn(
                "w-full justify-between",
                !selectedOption && "text-muted-foreground",
                triggerClassName
            )}
        >
            {selectedOption ? selectedOption.label : placeholder}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
    );

    return (
        <DropdownWrapper
            trigger={trigger}
            align="start"
            contentClassName={cn("w-full min-w-[var(--radix-dropdown-menu-trigger-width)]", contentClassName)}
            {...props}
        >
            <DropdownMenuRadioGroup value={value} onValueChange={onValueChange}>
                {options.map((option) => (
                    <DropdownMenuRadioItem
                        key={option.value}
                        value={option.value}
                    >
                        {option.icon && (
                            <option.icon className="mr-2 h-4 w-4" />
                        )}
                        {option.label}
                    </DropdownMenuRadioItem>
                ))}
            </DropdownMenuRadioGroup>
        </DropdownWrapper>
    );
}

// Note: Individual dropdown components can be imported directly from "@/components/ui/dropdown-menu" 