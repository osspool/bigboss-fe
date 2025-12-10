/**
 * Form System - Shadcn + @classytic/formkit Integration
 *
 * This module provides a pre-configured form generation system
 * using @classytic/formkit with Shadcn UI components.
 */

// Re-export from @classytic/formkit
export {
  FormGenerator as HeadlessFormGenerator,
  FormSystemProvider,
  useFormSystem,
  cn,
  type FormSchema,
  type BaseField,
  type Section,
  type FieldComponentProps,
  type FieldOption,
  type FieldOptionGroup,
  type ComponentRegistry,
  type LayoutRegistry,
  type SectionLayoutProps,
  type GridLayoutProps,
  type Variant,
} from "@classytic/formkit";

// Project-specific exports
export { FormGenerator } from "./FormGenerator";
export { ShadcnFormSystemProvider } from "./adapters/shadcn-adapter";
export { field, section, icon } from "./schema-helpers";
export {
  FormSection,
  FormGrid,
  FormFieldArray,
  FormFieldArrayItem,
} from "./components/FormSection";

export { FormFieldsRenderer } from "./components/FormFieldsRenderer";

