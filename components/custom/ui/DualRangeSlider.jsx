"use client";

import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn, generateStableKey } from "@/lib/utils";
import { Fragment, useMemo } from "react";
import { forwardRef } from "react";

const DualRangeSlider = forwardRef(
  ({ className, label, labelPosition = "top", ...props }, ref) => {
    const initialValue = useMemo(() => {
      return Array.isArray(props.value) ? props.value : [props.min, props.max];
    }, [props.value, props.min, props.max]);

    return (
      <SliderPrimitive.Root
        ref={ref}
        className={cn(
          "relative flex w-full touch-none select-none items-center",
          labelPosition === "top" ? "pt-8" : "pb-8",
          className
        )}
        {...props}
      >
        <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
          <SliderPrimitive.Range className="absolute h-full bg-primary" />
        </SliderPrimitive.Track>
        {initialValue.map((value, index) => (
          <Fragment key={generateStableKey(value, index, "dual-range-thumb")}>
            <SliderPrimitive.Thumb
              className={cn(
                "relative block h-5 w-5 rounded-full border-2 border-primary bg-background",
                "ring-offset-background transition-all duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                "hover:scale-110 hover:shadow-lg",
                "disabled:pointer-events-none disabled:opacity-50",
                "cursor-grab active:cursor-grabbing active:scale-95"
              )}
            >
              {label && (
                <span
                  className={cn(
                    "absolute flex w-full justify-center whitespace-nowrap",
                    "text-xs font-medium px-2 py-1 rounded-md bg-popover text-popover-foreground",
                    "shadow-sm border border-border",
                    labelPosition === "top" && "-top-10",
                    labelPosition === "bottom" && "top-7"
                  )}
                >
                  {label(value)}
                </span>
              )}
            </SliderPrimitive.Thumb>
          </Fragment>
        ))}
      </SliderPrimitive.Root>
    );
  }
);

DualRangeSlider.displayName = "DualRangeSlider";

export { DualRangeSlider };
