import { field, section } from "@/components/form/form-system";

/**
 * FAQs Page Form Schema
 * Matches FAQPageContent in types/cms.types.ts
 */
export const faqsPageSchema = () => ({
  sections: [
    // Header
    section(
      "header",
      "Page Header",
      [
        field.text("title", "Page Title", {
          required: true,
          placeholder: "Frequently Asked Questions",
        }),
        field.textarea("subtitle", "Subtitle", {
          rows: 2,
          placeholder: "Find answers to commonly asked questions about our products, shipping, returns, and more.",
        }),
      ],
      { cols: 1 }
    ),

    // Contact Section
    section(
      "contactSection",
      "Contact Section (Bottom CTA)",
      [
        field.text("contactSection.title", "Title", {
          placeholder: "Still have questions?",
        }),
        field.textarea("contactSection.description", "Description", {
          rows: 2,
          placeholder: "Our customer support team is here to help you with any questions not covered above.",
        }),
        field.email("contactSection.email", "Email", {
          placeholder: "support@bigboss.com",
        }),
        field.text("contactSection.phone", "Phone", {
          placeholder: "+880 1XXX-XXXXXX",
        }),
        field.text("contactSection.hours", "Hours", {
          placeholder: "Sunday - Thursday, 10AM - 6PM (BST)",
        }),
      ],
      { cols: 2 }
    ),

    // FAQ Categories (5 categories with questions)
    section(
      "category1",
      "Category 1: Orders & Shipping",
      [
        field.text("categories.0.title", "Category Title", {
          placeholder: "Orders & Shipping",
        }),
        field.text("categories.0.items.0.question", "Q1", {
          placeholder: "How long does shipping take?",
        }),
        field.textarea("categories.0.items.0.answer", "A1", {
          rows: 2,
          placeholder: "Standard shipping takes 3-5 business days...",
        }),
        field.text("categories.0.items.1.question", "Q2", {
          placeholder: "How can I track my order?",
        }),
        field.textarea("categories.0.items.1.answer", "A2", {
          rows: 2,
          placeholder: "Once shipped, you'll receive a tracking number...",
        }),
        field.text("categories.0.items.2.question", "Q3", {
          placeholder: "Do you ship internationally?",
        }),
        field.textarea("categories.0.items.2.answer", "A3", {
          rows: 2,
          placeholder: "Currently, we only ship within Bangladesh...",
        }),
        field.text("categories.0.items.3.question", "Q4", {
          placeholder: "What are the shipping costs?",
        }),
        field.textarea("categories.0.items.3.answer", "A4", {
          rows: 2,
          placeholder: "Shipping is FREE on orders over ৳2000...",
        }),
      ],
      { cols: 1 }
    ),

    section(
      "category2",
      "Category 2: Returns & Exchanges",
      [
        field.text("categories.1.title", "Category Title", {
          placeholder: "Returns & Exchanges",
        }),
        field.text("categories.1.items.0.question", "Q1", {
          placeholder: "What is your return policy?",
        }),
        field.textarea("categories.1.items.0.answer", "A1", {
          rows: 2,
          placeholder: "We offer a 14-day return policy...",
        }),
        field.text("categories.1.items.1.question", "Q2", {
          placeholder: "How do I initiate a return?",
        }),
        field.textarea("categories.1.items.1.answer", "A2", {
          rows: 2,
          placeholder: "Log into your account and navigate to order history...",
        }),
        field.text("categories.1.items.2.question", "Q3", {
          placeholder: "When will I receive my refund?",
        }),
        field.textarea("categories.1.items.2.answer", "A3", {
          rows: 2,
          placeholder: "Refunds are processed within 5-7 business days...",
        }),
        field.text("categories.1.items.3.question", "Q4", {
          placeholder: "Can I exchange for a different size?",
        }),
        field.textarea("categories.1.items.3.answer", "A4", {
          rows: 2,
          placeholder: "Yes! We're happy to exchange items...",
        }),
      ],
      { cols: 1 }
    ),

    section(
      "category3",
      "Category 3: Products & Sizing",
      [
        field.text("categories.2.title", "Category Title", {
          placeholder: "Products & Sizing",
        }),
        field.text("categories.2.items.0.question", "Q1", {
          placeholder: "How do I find my size?",
        }),
        field.textarea("categories.2.items.0.answer", "A1", {
          rows: 2,
          placeholder: "Check our Size Guide on each product page...",
        }),
        field.text("categories.2.items.1.question", "Q2", {
          placeholder: "What materials do you use?",
        }),
        field.textarea("categories.2.items.1.answer", "A2", {
          rows: 2,
          placeholder: "We use premium quality fabrics including 100% cotton...",
        }),
        field.text("categories.2.items.2.question", "Q3", {
          placeholder: "Are your products true to size?",
        }),
        field.textarea("categories.2.items.2.answer", "A3", {
          rows: 2,
          placeholder: "Our products are designed to be true to size...",
        }),
        field.text("categories.2.items.3.question", "Q4", {
          placeholder: "How do I care for my items?",
        }),
        field.textarea("categories.2.items.3.answer", "A4", {
          rows: 2,
          placeholder: "Care instructions are on the product label...",
        }),
      ],
      { cols: 1 }
    ),

    section(
      "category4",
      "Category 4: Payment & Security",
      [
        field.text("categories.3.title", "Category Title", {
          placeholder: "Payment & Security",
        }),
        field.text("categories.3.items.0.question", "Q1", {
          placeholder: "What payment methods do you accept?",
        }),
        field.textarea("categories.3.items.0.answer", "A1", {
          rows: 2,
          placeholder: "We accept COD, bKash, Nagad, Rocket, and bank transfers...",
        }),
        field.text("categories.3.items.1.question", "Q2", {
          placeholder: "Is my payment information secure?",
        }),
        field.textarea("categories.3.items.1.answer", "A2", {
          rows: 2,
          placeholder: "We use industry-standard SSL encryption...",
        }),
        field.text("categories.3.items.2.question", "Q3", {
          placeholder: "Can I pay in installments?",
        }),
        field.textarea("categories.3.items.2.answer", "A3", {
          rows: 2,
          placeholder: "Currently, we don't offer installment options...",
        }),
        field.text("categories.3.items.3.question", "Q4", {
          placeholder: "Do you charge for COD orders?",
        }),
        field.textarea("categories.3.items.3.answer", "A4", {
          rows: 2,
          placeholder: "No additional charge for Cash on Delivery...",
        }),
      ],
      { cols: 1 }
    ),

    section(
      "category5",
      "Category 5: Account & Support",
      [
        field.text("categories.4.title", "Category Title", {
          placeholder: "Account & Support",
        }),
        field.text("categories.4.items.0.question", "Q1", {
          placeholder: "How do I create an account?",
        }),
        field.textarea("categories.4.items.0.answer", "A1", {
          rows: 2,
          placeholder: "Click the account icon and select Sign Up...",
        }),
        field.text("categories.4.items.1.question", "Q2", {
          placeholder: "How can I contact customer support?",
        }),
        field.textarea("categories.4.items.1.answer", "A2", {
          rows: 2,
          placeholder: "Email us at support@bigboss.com or call...",
        }),
        field.text("categories.4.items.2.question", "Q3", {
          placeholder: "Do you have a loyalty program?",
        }),
        field.textarea("categories.4.items.2.answer", "A3", {
          rows: 2,
          placeholder: "Yes! BigBoss Rewards members earn points...",
        }),
        field.text("categories.4.items.3.question", "Q4", {
          placeholder: "How do I subscribe to the newsletter?",
        }),
        field.textarea("categories.4.items.3.answer", "A4", {
          rows: 2,
          placeholder: "Enter your email at the bottom of any page...",
        }),
      ],
      { cols: 1 }
    ),
  ],
});
