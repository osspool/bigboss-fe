import { field, section } from "@/components/form/form-system";

/**
 * Size Guide Page Form Schema
 * Matches SizeGuidePageContent in types/cms.types.ts
 */
export const sizeGuidePageSchema = () => ({
  sections: [
    // Header
    section(
      "header",
      "Page Header",
      [
        field.text("title", "Page Title", {
          required: true,
          placeholder: "Size Guide",
        }),
        field.textarea("subtitle", "Subtitle", {
          rows: 2,
          placeholder: "Find your perfect fit with our comprehensive size charts and measurement guides.",
        }),
      ],
      { cols: 1 }
    ),

    // How to Measure
    section(
      "howToMeasure",
      "How to Measure Section",
      [
        field.text("howToMeasure.title", "Title", {
          placeholder: "How to Measure",
        }),
        field.textarea("howToMeasure.description", "Description", {
          rows: 2,
          placeholder: "For the best fit, take measurements over underwear. Keep the tape measure snug but not tight.",
        }),
        // Measurement 1
        field.text("howToMeasure.measurements.0.name", "Measurement 1 Name", {
          placeholder: "Chest",
        }),
        field.text("howToMeasure.measurements.0.icon", "Measurement 1 Icon", {
          placeholder: "Ruler",
        }),
        field.textarea("howToMeasure.measurements.0.instruction", "Measurement 1 Instruction", {
          rows: 2,
          placeholder: "Measure around the fullest part of your chest, keeping the tape measure horizontal.",
        }),
        // Measurement 2
        field.text("howToMeasure.measurements.1.name", "Measurement 2 Name", {
          placeholder: "Waist",
        }),
        field.text("howToMeasure.measurements.1.icon", "Measurement 2 Icon", {
          placeholder: "Ruler",
        }),
        field.textarea("howToMeasure.measurements.1.instruction", "Measurement 2 Instruction", {
          rows: 2,
          placeholder: "Measure around your natural waistline, which is the narrowest part of your waist.",
        }),
        // Measurement 3
        field.text("howToMeasure.measurements.2.name", "Measurement 3 Name", {
          placeholder: "Hips",
        }),
        field.text("howToMeasure.measurements.2.icon", "Measurement 3 Icon", {
          placeholder: "Ruler",
        }),
        field.textarea("howToMeasure.measurements.2.instruction", "Measurement 3 Instruction", {
          rows: 2,
          placeholder: "Measure around the fullest part of your hips, keeping the tape measure horizontal.",
        }),
        // Measurement 4
        field.text("howToMeasure.measurements.3.name", "Measurement 4 Name", {
          placeholder: "Inseam",
        }),
        field.text("howToMeasure.measurements.3.icon", "Measurement 4 Icon", {
          placeholder: "Ruler",
        }),
        field.textarea("howToMeasure.measurements.3.instruction", "Measurement 4 Instruction", {
          rows: 2,
          placeholder: "Measure from the crotch seam to the bottom of the leg along the inside seam.",
        }),
      ],
      { cols: 2 }
    ),

    // Fit Types
    section(
      "fitTypes",
      "Fit Types Section",
      [
        field.text("fitTypes.title", "Title", {
          placeholder: "Understanding Fit Types",
        }),
        // Fit Type 1
        field.text("fitTypes.types.0.name", "Fit 1 Name", {
          placeholder: "Slim Fit",
        }),
        field.textarea("fitTypes.types.0.description", "Fit 1 Description", {
          rows: 2,
          placeholder: "Fitted through the chest and waist with a tapered silhouette. Best for a modern, tailored look.",
        }),
        field.text("fitTypes.types.0.recommendation", "Fit 1 Recommendation", {
          placeholder: "If between sizes, size up for comfort.",
        }),
        // Fit Type 2
        field.text("fitTypes.types.1.name", "Fit 2 Name", {
          placeholder: "Regular Fit",
        }),
        field.textarea("fitTypes.types.1.description", "Fit 2 Description", {
          rows: 2,
          placeholder: "Classic fit with room through the body. Not too tight, not too loose.",
        }),
        field.text("fitTypes.types.1.recommendation", "Fit 2 Recommendation", {
          placeholder: "True to size for most body types.",
        }),
        // Fit Type 3
        field.text("fitTypes.types.2.name", "Fit 3 Name", {
          placeholder: "Relaxed Fit",
        }),
        field.textarea("fitTypes.types.2.description", "Fit 3 Description", {
          rows: 2,
          placeholder: "Loose, comfortable fit with extra room throughout. Perfect for layering.",
        }),
        field.text("fitTypes.types.2.recommendation", "Fit 3 Recommendation", {
          placeholder: "If you prefer less oversized, consider sizing down.",
        }),
        // Fit Type 4
        field.text("fitTypes.types.3.name", "Fit 4 Name", {
          placeholder: "Oversized",
        }),
        field.textarea("fitTypes.types.3.description", "Fit 4 Description", {
          rows: 2,
          placeholder: "Intentionally loose and boxy for a streetwear aesthetic.",
        }),
        field.text("fitTypes.types.3.recommendation", "Fit 4 Recommendation", {
          placeholder: "Designed to fit large. Order your usual size for the intended look.",
        }),
      ],
      { cols: 2 }
    ),

    // Tips
    section(
      "tips",
      "Sizing Tips Section",
      [
        field.text("tips.title", "Title", {
          placeholder: "Sizing Tips",
        }),
        field.text("tips.items.0", "Tip 1", {
          placeholder: "When in doubt, size up for a more comfortable fit.",
        }),
        field.text("tips.items.1", "Tip 2", {
          placeholder: "Check the product description for specific fit notes on each item.",
        }),
        field.text("tips.items.2", "Tip 3", {
          placeholder: "Consider the fabric - cotton may shrink slightly after washing.",
        }),
        field.text("tips.items.3", "Tip 4", {
          placeholder: "For layering, you may want to go up one size.",
        }),
        field.text("tips.items.4", "Tip 5", {
          placeholder: "Read customer reviews for real-world fit feedback.",
        }),
      ],
      { cols: 1 }
    ),

    // Help Section
    section(
      "helpSection",
      "Help Section",
      [
        field.text("helpSection.title", "Title", {
          placeholder: "Still Not Sure?",
        }),
        field.textarea("helpSection.description", "Description", {
          rows: 2,
          placeholder: "Our customer service team is happy to help you find your perfect fit.",
        }),
        field.email("helpSection.email", "Email", {
          placeholder: "support@bigboss.com",
        }),
        field.text("helpSection.phone", "Phone", {
          placeholder: "+880 1XXX-XXXXXX",
        }),
      ],
      { cols: 2 }
    ),

    // Size Tables Note
    section(
      "tablesNote",
      "Size Tables",
      [
        field.info(
          "📊 Size Tables",
          "Size tables (Men's Tops, Men's Bottoms, Women's Tops, Women's Bottoms, Kids' Sizes) contain complex data with headers and multiple rows. These are best edited via JSON editor or a custom table component."
        ),
      ],
      { cols: 1 }
    ),
  ],
});
