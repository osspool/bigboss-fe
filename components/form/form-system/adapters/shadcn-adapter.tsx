"use client";

import type { ReactNode } from "react";
import {
  FormSystemProvider,
  type ComponentRegistry,
  type LayoutRegistry,
  type FieldComponentProps,
  type SectionLayoutProps,
  type GridLayoutProps,
} from "@classytic/formkit";
import { cn } from "@/lib/utils";

// Import existing Shadcn-based components
import FormInput from "@/components/form/form-utils/form-input";
import FormTextarea from "@/components/form/form-utils/form-textarea";
import SelectInput from "@/components/form/form-utils/select-input";
import ComboboxInput from "@/components/form/form-utils/combobox-input";
import SwitchInput from "@/components/form/form-utils/switch-input";
import CheckboxInput from "@/components/form/form-utils/checkbox-input";
import RadioInput from "@/components/form/form-utils/radio-input";
import DateInput from "@/components/form/form-utils/date-input";
import TagInput from "@/components/form/form-utils/tag-input";
import TagChoiceInput from "@/components/form/form-utils/tag-choice-input";
import SlugField from "@/components/form/form-utils/slug-field";

import { FormSection } from "@/components/form/form-system/components/FormSection";

// ============================================================================
// ADAPTER TYPES
// ============================================================================

type AdapterComponent = React.ComponentType<any>;

// ============================================================================
// ADAPTER FACTORY FUNCTIONS
// ============================================================================

/**
 * Creates an adapter that passes all props through.
 * Use for components that don't need prop transformations.
 */
function createAdapter(Component: AdapterComponent) {
  return function Adapter(props: FieldComponentProps) {
    const { field, control, disabled, ...rest } = props;
    return (
      <Component
        {...field}
        control={control}
        disabled={disabled}
        {...rest}
      />
    );
  };
}

/**
 * Creates an adapter that transforms 'options' to 'items'.
 * Use for select-based components (select, combobox, multiselect).
 */
function createSelectAdapter(Component: AdapterComponent) {
  return function SelectAdapter(props: FieldComponentProps) {
    const { field, control, disabled, ...rest } = props;
    const { options, ...fieldWithoutOptions } = field;

    // Transform options to items format expected by SelectInput
    const items = options?.map((opt) => {
      if ("options" in opt) {
        // It's a group
        return {
          label: opt.label,
          items: opt.options.map((o) => ({
            value: o.value,
            label: o.label,
            disabled: o.disabled,
          })),
        };
      }
      // It's a flat option
      return {
        value: opt.value,
        label: opt.label,
        disabled: opt.disabled,
      };
    }) || [];

    return (
      <Component
        {...fieldWithoutOptions}
        control={control}
        disabled={disabled}
        items={items}
        {...rest}
      />
    );
  };
}

// ============================================================================
// COMPONENT REGISTRY
// ============================================================================

const components: ComponentRegistry = {
  // Text-based inputs - no transformation needed
  text: createAdapter(FormInput),
  email: createAdapter(FormInput),
  url: createAdapter(FormInput),
  tel: createAdapter(FormInput),
  number: createAdapter(FormInput),
  password: createAdapter(FormInput),

  // Textarea
  textarea: createAdapter(FormTextarea),

  // Select-based - transform options -> items
  select: createSelectAdapter(SelectInput),
  combobox: createSelectAdapter(ComboboxInput),
  multiselect: createSelectAdapter(TagChoiceInput),
  tagChoice: createSelectAdapter(TagChoiceInput),

  // Boolean inputs
  switch: createAdapter(SwitchInput),
  checkbox: createAdapter(CheckboxInput),

  // Choice inputs
  radio: createSelectAdapter(RadioInput),

  // Date inputs
  date: createAdapter(DateInput),

  // Tag inputs
  tag: createAdapter(TagInput),
  tags: createAdapter(TagInput),

  // Special inputs
  slug: createAdapter(SlugField),

  // Default fallback
  default: createAdapter(FormInput),
};

// ============================================================================
// LAYOUT REGISTRY
// ============================================================================

interface SectionProps extends SectionLayoutProps {
  icon?: ReactNode;
}

interface GridProps extends GridLayoutProps {
  variant?: string;
}

const layouts: LayoutRegistry = {
  section: ({
    title,
    description,
    icon,
    variant,
    className,
    children,
    collapsible,
    defaultCollapsed,
  }: SectionProps) => {
    // Transparent variant - just render children
    if (variant === "transparent") {
      return <div className={className}>{children}</div>;
    }

    // Map variant names
    const sectionVariant = variant === "compact" ? "subtle" : (variant || "default");

    return (
      <div className="mb-6">
        <FormSection
          title={title}
          description={description}
          icon={icon}
          variant={sectionVariant as "default" | "card" | "subtle"}
          className={className}
          collapsible={collapsible}
          defaultOpen={!defaultCollapsed}
        >
          {children}
        </FormSection>
      </div>
    );
  },

  grid: ({ cols = 1, children, className }: GridProps) => {
    const colsClass: Record<number, string> = {
      1: "grid-cols-1",
      2: "grid-cols-1 md:grid-cols-2",
      3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
      4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
      5: "grid-cols-1 md:grid-cols-2 lg:grid-cols-5",
      6: "grid-cols-1 md:grid-cols-3 lg:grid-cols-6",
    };

    return (
      <div className={cn("grid gap-4", colsClass[cols] || "grid-cols-1 md:grid-cols-2", className)}>
        {children}
      </div>
    );
  },
};

// ============================================================================
// PROVIDER
// ============================================================================

interface ShadcnFormSystemProviderProps {
  children: ReactNode;
}

/**
 * Pre-configured FormSystemProvider for Shadcn UI
 *
 * @example
 * ```tsx
 * <ShadcnFormSystemProvider>
 *   <FormGenerator schema={schema} control={form.control} />
 * </ShadcnFormSystemProvider>
 * ```
 */
export function ShadcnFormSystemProvider({ children }: ShadcnFormSystemProviderProps) {
  return (
    <FormSystemProvider components={components} layouts={layouts}>
      {children}
    </FormSystemProvider>
  );
}

// Export registries for customization
export { components, layouts };

