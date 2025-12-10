import type { ReactNode } from "react";
import type { BaseField, Section, FieldOption, Variant } from "@classytic/formkit";
import type { FieldValues } from "react-hook-form";

// ============================================================================
// ICON HELPER
// ============================================================================

/**
 * Helper to create icon components for form fields
 *
 * @example
 * ```tsx
 * import { icon } from "@/components/form/form-system";
 *
 * const schema = {
 *   sections: [{
 *     icon: icon("user"),
 *     title: "User Info",
 *     fields: [...]
 *   }]
 * };
 * ```
 */
export function icon(iconName: string, className = "h-4 w-4"): () => ReactNode {
  // Dynamic import would be better, but for now return a placeholder
  // You should adjust this to use your actual icon component
  return () => {
    // Import your icon component here
    // e.g., return <Icon name={iconName} className={className} />;
    return null;
  };
}

// ============================================================================
// FIELD HELPERS
// ============================================================================

interface FieldProps extends Partial<BaseField> {
  placeholder?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
  [key: string]: unknown;
}

interface SelectFieldProps extends FieldProps {
  searchPlaceholder?: string;
  emptyText?: string;
}

/**
 * Helper functions to create field definitions with better DX
 *
 * @example
 * ```tsx
 * import { field } from "@/components/form/form-system";
 *
 * const schema = {
 *   sections: [{
 *     fields: [
 *       field.text("firstName", "First Name", { required: true }),
 *       field.email("email", "Email", { placeholder: "user@example.com" }),
 *       field.select("role", "Role", [
 *         { value: "admin", label: "Admin" },
 *         { value: "user", label: "User" },
 *       ]),
 *     ]
 *   }]
 * };
 * ```
 */
export const field = {
  /**
   * Text input field
   */
  text: (name: string, label: string, props: FieldProps = {}): BaseField => ({
    type: "text",
    name,
    label,
    ...props,
  }),

  /**
   * Email input field
   */
  email: (name: string, label: string, props: FieldProps = {}): BaseField => ({
    type: "email",
    name,
    label,
    placeholder: props.placeholder || "example@email.com",
    ...props,
  }),

  /**
   * URL input field
   */
  url: (name: string, label: string, props: FieldProps = {}): BaseField => ({
    type: "url",
    name,
    label,
    placeholder: props.placeholder || "https://example.com",
    ...props,
  }),

  /**
   * Telephone input field
   */
  tel: (name: string, label: string, props: FieldProps = {}): BaseField => ({
    type: "tel",
    name,
    label,
    placeholder: props.placeholder || "01XXXXXXXXX",
    ...props,
  }),

  /**
   * Number input field
   */
  number: (name: string, label: string, props: FieldProps = {}): BaseField => ({
    type: "number",
    name,
    label,
    min: 0,
    ...props,
  }),

  /**
   * Password input field
   */
  password: (name: string, label: string, props: FieldProps = {}): BaseField => ({
    type: "password",
    name,
    label,
    placeholder: props.placeholder || "••••••••",
    ...props,
  }),

  /**
   * Textarea field
   */
  textarea: (name: string, label: string, props: FieldProps = {}): BaseField => ({
    type: "textarea",
    name,
    label,
    rows: (props.rows as number) || 3,
    ...props,
  }),

  /**
   * Select dropdown field
   */
  select: (
    name: string,
    label: string,
    options: FieldOption[],
    props: FieldProps = {}
  ): BaseField => ({
    type: "select",
    name,
    label,
    options,
    ...props,
  }),

  /**
   * Combobox (searchable select) field
   */
  combobox: (
    name: string,
    label: string,
    options: FieldOption[],
    props: SelectFieldProps = {}
  ): BaseField => ({
    type: "combobox",
    name,
    label,
    options,
    searchPlaceholder: props.searchPlaceholder || "Search...",
    emptyText: props.emptyText || "No items found.",
    ...props,
  }),

  /**
   * Multi-select field (tag choice)
   */
  multiselect: (
    name: string,
    label: string,
    options: FieldOption[],
    props: FieldProps = {}
  ): BaseField => ({
    type: "multiselect",
    name,
    label,
    options,
    placeholder: props.placeholder || "Select options...",
    ...props,
  }),

  /**
   * Tag choice field (multi-select with tag display)
   */
  tagChoice: (
    name: string,
    label: string,
    options: FieldOption[],
    props: FieldProps = {}
  ): BaseField => ({
    type: "tagChoice",
    name,
    label,
    options,
    placeholder: props.placeholder || "Select options...",
    ...props,
  }),

  /**
   * Switch (toggle) field
   */
  switch: (name: string, label: string, props: FieldProps = {}): BaseField => ({
    type: "switch",
    name,
    label,
    ...props,
  }),

  /**
   * Checkbox field
   */
  checkbox: (name: string, label: string, props: FieldProps = {}): BaseField => ({
    type: "checkbox",
    name,
    label,
    ...props,
  }),

  /**
   * Radio group field
   */
  radio: (
    name: string,
    label: string,
    options: FieldOption[],
    props: FieldProps = {}
  ): BaseField => ({
    type: "radio",
    name,
    label,
    options,
    ...props,
  }),

  /**
   * Date picker field
   */
  date: (name: string, label: string, props: FieldProps = {}): BaseField => ({
    type: "date",
    name,
    label,
    ...props,
  }),

  /**
   * DateTime picker field
   */
  datetime: (name: string, label: string, props: FieldProps = {}): BaseField => ({
    type: "datetime",
    name,
    label,
    ...props,
  }),

  /**
   * Tag input field (free-form tags)
   */
  tags: (name: string, label: string, props: FieldProps = {}): BaseField => ({
    type: "tags",
    name,
    label,
    placeholder: props.placeholder || "Add tags...",
    ...props,
  }),

  /**
   * Slug field (URL-safe string)
   */
  slug: (
    name: string,
    label: string,
    sourceValue?: string,
    props: FieldProps = {}
  ): BaseField => ({
    type: "slug",
    name,
    label,
    sourceValue,
    placeholder: props.placeholder || "my-page-slug",
    ...props,
  }),

  /**
   * Custom field with render function
   */
  custom: (
    name: string,
    label: string,
    render: (props: { control?: unknown; disabled?: boolean }) => ReactNode,
    props: FieldProps = {}
  ): BaseField => ({
    type: "custom",
    name,
    label,
    render,
    ...props,
  }),

  /**
   * Heading/divider field for visual organization
   * Used to separate sections in the form
   */
  heading: (text: string, props: FieldProps = {}): BaseField => ({
    type: "heading",
    name: `heading-${Math.random().toString(36).substring(7)}`,
    label: text,
    ...props,
  }),

  /**
   * Info/note field for displaying informational messages
   * Used to show hints, warnings, or additional context
   */
  info: (title: string, message: string, props: FieldProps = {}): BaseField => ({
    type: "info",
    name: `info-${Math.random().toString(36).substring(7)}`,
    label: title,
    description: message,
    ...props,
  }),
};

// ============================================================================
// SECTION HELPER
// ============================================================================

interface SectionProps<T extends FieldValues = FieldValues> {
  /** Number of columns (default: 2) */
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | number;
  /** Section variant: 'default' | 'card' | 'subtle' | 'transparent' */
  variant?: Variant | "card" | "subtle" | "transparent";
  /** Make section collapsible */
  collapsible?: boolean;
  /** Default open state for collapsible sections */
  defaultOpen?: boolean;
  /** Icon component or JSX element */
  icon?: ReactNode;
  /** Section description */
  description?: string;
  /** Additional CSS classes */
  className?: string;
  /** Gap between grid items */
  gap?: number;
}

/**
 * Helper to create section definitions
 *
 * @param id - Section identifier
 * @param title - Section title
 * @param fields - Array of field definitions
 * @param props - Additional section properties
 *
 * @example
 * ```tsx
 * import { section, field } from "@/components/form/form-system";
 *
 * // Basic section
 * section("user-info", "User Information", [
 *   field.text("name", "Name"),
 *   field.email("email", "Email"),
 * ])
 *
 * // Collapsible card section with icon
 * section("advanced", "Advanced Settings", fields, {
 *   variant: "card",
 *   collapsible: true,
 *   defaultOpen: false,
 *   icon: <Settings className="h-4 w-4" />,
 *   description: "Configure advanced options",
 * })
 * ```
 */
export function section<T extends FieldValues = FieldValues>(
  id: string,
  title: string,
  fields: BaseField<T>[],
  props: SectionProps<T> = {}
): Section<T> {
  return {
    id,
    title,
    fields,
    cols: props.cols || 2,
    variant: props.variant as Variant,
    collapsible: props.collapsible,
    defaultCollapsed: props.defaultOpen === false,
    icon: props.icon,
    description: props.description,
    className: props.className,
    gap: props.gap,
  };
}

