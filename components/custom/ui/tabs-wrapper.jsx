"use client";

import { memo, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

// Variant configurations (memoized outside component)
const LIST_BASE_CLASS = "flex flex-wrap items-center justify-start gap-1 h-auto rounded-md p-1 shadow-sm transition-colors";

const LIST_VARIANTS = {
    default: "border border-border/50 bg-muted/60 backdrop-blur-sm",
    primary: "border border-primary/30 bg-primary/10",
    secondary: "border border-secondary/40 bg-secondary/10",
    outline: "border border-border bg-background",
    ghost: "border border-transparent bg-transparent shadow-none",
    underline: "w-full mb-4 rounded-none border-b border-border/60 bg-transparent p-0 shadow-none gap-6",
};

const TRIGGER_VARIANTS = {
    default: "text-muted-foreground hover:bg-muted/40 hover:text-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
    primary: "text-primary hover:bg-primary/10 hover:text-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
    secondary: "text-secondary-foreground hover:bg-secondary/10 hover:text-secondary-foreground data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground",
    outline: "text-foreground hover:bg-accent/40 hover:text-accent-foreground data-[state=active]:bg-accent data-[state=active]:text-accent-foreground",
    ghost: "text-muted-foreground hover:bg-muted/30 hover:text-foreground data-[state=active]:bg-muted data-[state=active]:text-foreground",
    underline: "text-muted-foreground rounded-none px-0 py-2 hover:bg-transparent hover:text-primary border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none",
};

export const TabsWrapper = memo(function TabsWrapper({
    defaultValue,
    value,
    onValueChange,
    children,
    className,
    listClassName,
    contentClassName,
    variant = "default",
    orientation = "horizontal",
    layout = "default", // "default" | "flex" | "sidebar"
    withScrollArea = false,
    scrollAreaClassName,
    ...props
}) {
    // Determine if this is a flex layout (for modals/sidebars)
    const isFlexLayout = useMemo(() => 
        layout === "flex" || layout === "sidebar", 
        [layout]
    );

    // Memoize computed classes
    const computedClasses = useMemo(() => ({
        root: cn(
            "w-full",
            isFlexLayout && "flex-1 flex flex-col",
            className
        ),
        list: cn(
            LIST_BASE_CLASS,
            isFlexLayout ? "w-full" : "w-fit",
            !isFlexLayout && variant !== "underline" && "mb-6",
            LIST_VARIANTS[variant] ?? LIST_VARIANTS.default,
            listClassName
        ),
    }), [isFlexLayout, className, variant, listClassName]);

    return (
        <Tabs
            defaultValue={defaultValue}
            value={value}
            onValueChange={onValueChange}
            orientation={orientation}
            className={computedClasses.root}
            {...props}
        >
            <TabsList 
                className={computedClasses.list}
            >
                {children}
            </TabsList>
        </Tabs>
    );
});

export const TabTrigger = memo(function TabTrigger({ 
    value, 
    children, 
    className, 
    variant = "default", 
    icon, 
    hideTextOnMobile = false, 
    disabled = false,
    ...props 
}) {
    const computedClassName = useMemo(() => cn(
        "flex items-center gap-2 transition-colors duration-200",
        TRIGGER_VARIANTS[variant] ?? TRIGGER_VARIANTS.default, 
        className
    ), [variant, className]);

    return (
        <TabsTrigger
            value={value}
            disabled={disabled}
            className={computedClassName}
            {...props}
        >
            {icon}
            {hideTextOnMobile ? (
                <span className="hidden sm:inline">{children}</span>
            ) : (
                children
            )}
        </TabsTrigger>
    );
});

export const TabContent = memo(function TabContent({ 
    value, 
    children, 
    className, 
    withScrollArea = false, 
    scrollAreaClassName, 
    padding = true, 
    forceMount = false,
    ...props 
}) {
    const contentClassName = useMemo(() => cn(
        "space-y-4",
        padding && !withScrollArea && "mt-6",
        withScrollArea && "mt-0 h-full",
        className
    ), [padding, withScrollArea, className]);

    const scrollAreaPaddingClassName = useMemo(() => 
        cn(padding && "px-6 py-4"),
        [padding]
    );

    return (
        <TabsContent
            value={value}
            forceMount={forceMount}
            className={contentClassName}
            {...props}
        >
            {withScrollArea ? (
                <ScrollArea className={cn("h-full", scrollAreaClassName)}>
                    <div className={scrollAreaPaddingClassName}>
                        {children}
                    </div>
                </ScrollArea>
            ) : (
                children
            )}
        </TabsContent>
    );
});

/**
 * DynamicTabs - Declarative tabs with array configuration
 * 
 * Use this when you want to define tabs from data/config.
 * For more control, use TabsWrapper + TabTrigger + TabContent directly.
 * 
 * @example
 * ```jsx
 * <DynamicTabs 
 *   value={activeTab} 
 *   onValueChange={setActiveTab}
 *   tabs={[
 *     { value: "tab1", label: "Tab 1", content: <Content1 /> },
 *     { value: "tab2", label: "Tab 2", icon: <Icon />, content: <Content2 /> }
 *   ]}
 * />
 * ```
 */
export const DynamicTabs = memo(function DynamicTabs({
    tabs = [],
    defaultValue,
    value,
    onValueChange,
    variant = "default",
    layout = "default",
    className,
    listClassName,
    listWrapperClassName,
    contentClassName,
    scrollable = false,
    ...props
}) {
    const isFlexLayout = useMemo(() => 
        layout === "flex" || layout === "sidebar",
        [layout]
    );

    const gridTemplateColumns = useMemo(() => 
        `repeat(${Math.max(tabs.length, 1)}, minmax(0, 1fr))`,
        [tabs.length]
    );

    // Memoize computed class names
    const computedClasses = useMemo(() => ({
        root: cn(
            "w-full",
            isFlexLayout && "flex-1 flex flex-col",
            className
        ),
        listWrapper: cn("w-full px-6", listWrapperClassName),
        flexList: cn(
            "grid auto-cols-fr items-center justify-center gap-1 h-auto",
            variant === "underline"
                ? "rounded-none border-b border-border/60 bg-transparent p-0 shadow-none gap-6"
                : "rounded-md p-1 shadow-sm backdrop-blur-sm",
            LIST_VARIANTS[variant] ?? LIST_VARIANTS.default,
            listClassName
        ),
        standardList: cn(
            LIST_BASE_CLASS,
            variant !== "underline" && "w-fit mb-6",
            LIST_VARIANTS[variant] ?? LIST_VARIANTS.default,
            listClassName
        ),
        contentWrapper: cn(
            isFlexLayout && scrollable && "flex-1 overflow-hidden"
        ),
        flexContent: cn("mt-0 h-full", contentClassName),
        standardContent: cn("space-y-4 mt-6", contentClassName),
    }), [isFlexLayout, className, listWrapperClassName, listClassName, variant, scrollable, contentClassName]);
    
    return (
        <Tabs
            defaultValue={defaultValue}
            value={value}
            onValueChange={onValueChange}
            className={computedClasses.root}
            {...props}
        >
            {/* List wrapper for flex layouts */}
            {isFlexLayout ? (
                <div className={computedClasses.listWrapper}>
                    <TabsList 
                        className={computedClasses.flexList}
                        style={{ 
                            display: 'grid', 
                            gridTemplateColumns 
                        }}
                    >
                        {tabs.map((tab) => (
                            <TabTrigger 
                                key={tab.value} 
                                value={tab.value}
                                variant={variant}
                                disabled={tab.disabled}
                            className="justify-center px-4 py-2"
                            >
                                {tab.icon}
                                {tab.hideTextOnMobile ? (
                                    <span className="hidden sm:inline">{tab.label}</span>
                                ) : (
                                    tab.label
                                )}
                            </TabTrigger>
                        ))}
                    </TabsList>
                </div>
            ) : (
                // Standard list for normal layouts - responsive grid that wraps
                <TabsList 
                    className={computedClasses.standardList}
                >
                    {tabs.map((tab) => (
                        <TabTrigger 
                            key={tab.value} 
                            value={tab.value}
                            variant={variant}
                            disabled={tab.disabled}
                            className="whitespace-nowrap"
                        >
                            {tab.icon}
                            {tab.hideTextOnMobile ? (
                                <span className="hidden sm:inline text-sm">{tab.label}</span>
                            ) : (
                                <span className="text-sm">{tab.label}</span>
                            )}
                        </TabTrigger>
                    ))}
                </TabsList>
            )}

            {/* Content area */}
            <div className={computedClasses.contentWrapper}>
                {isFlexLayout && scrollable ? (
                    <ScrollArea className="h-full w-full">
                        {tabs.map((tab) => (
                            <TabsContent 
                                key={tab.value} 
                                value={tab.value}
                                className={computedClasses.flexContent}
                            >
                                {tab.content}
                            </TabsContent>
                        ))}
                    </ScrollArea>
                ) : (
                    tabs.map((tab) => (
                        <TabsContent 
                            key={tab.value} 
                            value={tab.value}
                            className={computedClasses.standardContent}
                        >
                            {tab.content}
                        </TabsContent>
                    ))
                )}
            </div>
        </Tabs>
    );
}); 