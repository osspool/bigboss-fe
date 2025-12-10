import { field, section } from "@/components/form/form-system";

/**
 * Returns & Exchanges Page Form Schema
 * Matches ReturnsPageContent in types/cms.types.ts
 *
 * Improved design with:
 * - Clear section grouping for each step and content section
 * - Descriptive field labels
 * - Better visual organization
 */
export const returnsPageSchema = () => ({
  sections: [
    // Header Section
    section(
      "header",
      "Page Header",
      [
        field.text("title", "Page Title", {
          required: true,
          placeholder: "Returns & Exchanges",
        }),
        field.textarea("subtitle", "Subtitle", {
          rows: 2,
          placeholder: "Not completely satisfied? We've got you covered with our hassle-free return policy.",
          fullWidth: true,
        }),
      ],
      { cols: 1 }
    ),

    // Step 1 - Initiate Return
    section(
      "step_1",
      "Step 1 - Initiate Return",
      [
        field.text("steps.0.icon", "Icon Name", {
          placeholder: "Package",
          description: "Available icons: Package, Clock, RefreshCw, CheckCircle",
        }),
        field.text("steps.0.title", "Step Title", {
          placeholder: "Initiate Return",
        }),
        field.textarea("steps.0.description", "Step Description", {
          rows: 3,
          placeholder: "Contact our customer service or log into your account to start a return request within 14 days of delivery.",
          fullWidth: true,
        }),
      ],
      { cols: 2 }
    ),

    // Step 2 - Pack Your Item
    section(
      "step_2",
      "Step 2 - Pack Your Item",
      [
        field.text("steps.1.icon", "Icon Name", {
          placeholder: "Clock",
          description: "Available icons: Package, Clock, RefreshCw, CheckCircle",
        }),
        field.text("steps.1.title", "Step Title", {
          placeholder: "Pack Your Item",
        }),
        field.textarea("steps.1.description", "Step Description", {
          rows: 3,
          placeholder: "Pack the item securely in its original packaging with all tags attached. Include your order number.",
          fullWidth: true,
        }),
      ],
      { cols: 2 }
    ),

    // Step 3 - Ship It Back
    section(
      "step_3",
      "Step 3 - Ship It Back",
      [
        field.text("steps.2.icon", "Icon Name", {
          placeholder: "RefreshCw",
          description: "Available icons: Package, Clock, RefreshCw, CheckCircle",
        }),
        field.text("steps.2.title", "Step Title", {
          placeholder: "Ship It Back",
        }),
        field.textarea("steps.2.description", "Step Description", {
          rows: 3,
          placeholder: "Use our prepaid shipping label or ship via your preferred carrier to our returns center.",
          fullWidth: true,
        }),
      ],
      { cols: 2 }
    ),

    // Step 4 - Get Refunded
    section(
      "step_4",
      "Step 4 - Get Refunded",
      [
        field.text("steps.3.icon", "Icon Name", {
          placeholder: "CheckCircle",
          description: "Available icons: Package, Clock, RefreshCw, CheckCircle",
        }),
        field.text("steps.3.title", "Step Title", {
          placeholder: "Get Refunded",
        }),
        field.textarea("steps.3.description", "Step Description", {
          rows: 3,
          placeholder: "Once we receive and inspect your return, your refund will be processed within 5-7 business days.",
          fullWidth: true,
        }),
      ],
      { cols: 2 }
    ),

    // Policy Section - Return Policy (Highlighted Box)
    section(
      "policySection",
      "📋 Return Policy Section",
      [
        field.text("sections.0.type", "Section Type", {
          placeholder: "policy",
          description: "Type: 'policy' (renders as highlighted box)",
          disabled: true,
        }),
        field.text("sections.0.title", "Section Title", {
          placeholder: "Return Policy",
        }),
        field.text("sections.0.highlight.title", "Highlight Box Title", {
          placeholder: "14-Day Return Window",
        }),
        field.textarea("sections.0.highlight.content", "Highlight Box Content", {
          rows: 3,
          placeholder: "You have 14 days from the date of delivery to return any item for a full refund. Items must be unworn, unwashed, and in their original condition with all tags attached.",
          fullWidth: true,
        }),
      ],
      { cols: 1 }
    ),

    // Grid Section - Eligible Items (Two Columns)
    section(
      "eligibleSection",
      "✅ Eligible Items Section (Grid Layout)",
      [
        field.text("sections.1.type", "Section Type", {
          placeholder: "grid",
          description: "Type: 'grid' (renders as two-column layout)",
          disabled: true,
        }),
        field.text("sections.1.title", "Section Title", {
          placeholder: "Eligible Items",
          fullWidth: true,
        }),
      ],
      { cols: 1 }
    ),

    // Grid Column 1 - Returnable Items
    section(
      "eligibleSection_returnable",
      "✅ Returnable Items (Green Column)",
      [
        field.text("sections.1.columns.0.title", "Column Title", {
          placeholder: "Returnable",
        }),
        field.text("sections.1.columns.0.variant", "Column Style", {
          placeholder: "success",
          description: "Use 'success' for green styling",
          disabled: true,
        }),
        field.text("sections.1.columns.0.items.0", "Item 1", {
          placeholder: "Clothing items in original condition",
        }),
        field.text("sections.1.columns.0.items.1", "Item 2", {
          placeholder: "Accessories with original packaging",
        }),
        field.text("sections.1.columns.0.items.2", "Item 3", {
          placeholder: "Items with tags still attached",
        }),
        field.text("sections.1.columns.0.items.3", "Item 4", {
          placeholder: "Unworn and unwashed products",
        }),
      ],
      { cols: 2 }
    ),

    // Grid Column 2 - Non-Returnable Items
    section(
      "eligibleSection_nonReturnable",
      "❌ Non-Returnable Items (Red Column)",
      [
        field.text("sections.1.columns.1.title", "Column Title", {
          placeholder: "Non-Returnable",
        }),
        field.text("sections.1.columns.1.variant", "Column Style", {
          placeholder: "destructive",
          description: "Use 'destructive' for red styling",
          disabled: true,
        }),
        field.text("sections.1.columns.1.items.0", "Item 1", {
          placeholder: "Undergarments and swimwear",
        }),
        field.text("sections.1.columns.1.items.1", "Item 2", {
          placeholder: "Items marked as 'Final Sale'",
        }),
        field.text("sections.1.columns.1.items.2", "Item 3", {
          placeholder: "Personalized or customized items",
        }),
        field.text("sections.1.columns.1.items.3", "Item 4", {
          placeholder: "Items showing signs of wear",
        }),
      ],
      { cols: 2 }
    ),

    // Text Section - Exchanges
    section(
      "exchangesSection",
      "🔄 Exchanges Section",
      [
        field.text("sections.2.type", "Section Type", {
          placeholder: "text",
          description: "Type: 'text' (renders as text with optional list)",
          disabled: true,
        }),
        field.text("sections.2.title", "Section Title", {
          placeholder: "Exchanges",
        }),
        field.textarea("sections.2.content", "Intro Text", {
          rows: 2,
          placeholder: "Want a different size or color? We're happy to exchange your item for you. Here's how:",
          fullWidth: true,
        }),
        field.text("sections.2.list.0", "List Item 1", {
          placeholder: "Contact our customer service team with your order number and desired exchange",
        }),
        field.text("sections.2.list.1", "List Item 2", {
          placeholder: "We'll send you a prepaid shipping label for the return",
        }),
        field.text("sections.2.list.2", "List Item 3", {
          placeholder: "Once we receive your item, we'll ship out the replacement",
        }),
        field.text("sections.2.list.3", "List Item 4", {
          placeholder: "If there's a price difference, we'll adjust accordingly",
        }),
      ],
      { cols: 2 }
    ),

    // Text Section - Refund Information
    section(
      "refundSection",
      "💰 Refund Information Section",
      [
        field.text("sections.3.type", "Section Type", {
          placeholder: "text",
          description: "Type: 'text' (renders as text paragraphs)",
          disabled: true,
        }),
        field.text("sections.3.title", "Section Title", {
          placeholder: "Refund Information",
        }),
        field.textarea("sections.3.paragraphs.0", "Paragraph Text", {
          rows: 3,
          placeholder: "Refunds will be processed to your original payment method within 5-7 business days after we receive and inspect your return.",
          fullWidth: true,
        }),
      ],
      { cols: 1 }
    ),

    // Text Section - Damaged Items
    section(
      "damagedSection",
      "⚠️ Damaged or Defective Items Section",
      [
        field.text("sections.4.type", "Section Type", {
          placeholder: "text",
          description: "Type: 'text' (renders as text with list and footer)",
          disabled: true,
        }),
        field.text("sections.4.title", "Section Title", {
          placeholder: "Damaged or Defective Items",
        }),
        field.textarea("sections.4.content", "Intro Text", {
          rows: 2,
          placeholder: "Received a damaged or defective item? We sincerely apologize. Please contact us within 48 hours of delivery with:",
          fullWidth: true,
        }),
        field.text("sections.4.list.0", "Required Item 1", {
          placeholder: "Your order number",
        }),
        field.text("sections.4.list.1", "Required Item 2", {
          placeholder: "Photos of the damaged/defective item",
        }),
        field.text("sections.4.list.2", "Required Item 3", {
          placeholder: "Description of the issue",
        }),
        field.text("sections.4.footer", "Footer Note", {
          placeholder: "We'll arrange a free return and send you a replacement immediately.",
          fullWidth: true,
        }),
      ],
      { cols: 2 }
    ),

    // Contact Section
    section(
      "contactSection",
      "📞 Need Help? Contact Section",
      [
        field.text("contactSection.title", "Section Title", {
          placeholder: "Need Help?",
        }),
        field.textarea("contactSection.content", "Description", {
          rows: 2,
          placeholder: "Our customer service team is here to assist you with any questions about returns or exchanges.",
          fullWidth: true,
        }),
        field.email("contactSection.email", "Email Address", {
          placeholder: "support@bigboss.com",
        }),
        field.text("contactSection.phone", "Phone Number", {
          placeholder: "+880 1XXX-XXXXXX",
        }),
        field.text("contactSection.hours", "Business Hours", {
          placeholder: "Sunday - Thursday, 10AM - 6PM (BST)",
        }),
      ],
      { cols: 3 }
    ),
  ],
});
