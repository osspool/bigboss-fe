import { field, section } from "@/components/form/form-system";

/**
 * Terms of Service Page Form Schema
 * Uses PolicyPageContent type from types/cms.types.ts
 */
export const termsPageSchema = () => ({
  sections: [
    // Header
    section(
      "header",
      "Page Header",
      [
        field.text("title", "Page Title", {
          required: true,
          placeholder: "Terms of Service",
        }),
        field.text("lastUpdated", "Last Updated", {
          required: true,
          placeholder: "December 2024",
        }),
        field.textarea("intro", "Introduction", {
          rows: 3,
          placeholder: "Please read these Terms of Service carefully before using the BigBoss website...",
        }),
      ],
      { cols: 1 }
    ),

    // Section 1
    section(
      "section1",
      "Section 1: Acceptance of Terms",
      [
        field.text("sections.0.title", "Title", {
          placeholder: "1. Acceptance of Terms",
        }),
        field.textarea("sections.0.content", "Content", {
          rows: 3,
          placeholder: "By accessing and using this website, you accept and agree to be bound by the terms...",
        }),
      ],
      { cols: 1 }
    ),

    // Section 2
    section(
      "section2",
      "Section 2: Use of Website",
      [
        field.text("sections.1.title", "Title", {
          placeholder: "2. Use of Website",
        }),
        field.textarea("sections.1.content", "Content", {
          rows: 2,
          placeholder: "You may use our website for lawful purposes only. You agree not to:",
        }),
        field.text("sections.1.list.0", "List Item 1", {
          placeholder: "Use the website in any way that violates applicable laws...",
        }),
        field.text("sections.1.list.1", "List Item 2", {
          placeholder: "Attempt to gain unauthorized access to any part...",
        }),
        field.text("sections.1.list.2", "List Item 3", {
          placeholder: "Use the website to transmit harmful code...",
        }),
        field.text("sections.1.list.3", "List Item 4", {
          placeholder: "Collect or harvest any information...",
        }),
        field.text("sections.1.list.4", "List Item 5", {
          placeholder: "Impersonate any person or entity...",
        }),
      ],
      { cols: 1 }
    ),

    // Section 3
    section(
      "section3",
      "Section 3: Account Registration",
      [
        field.text("sections.2.title", "Title", {
          placeholder: "3. Account Registration",
        }),
        field.textarea("sections.2.content", "Content", {
          rows: 3,
          placeholder: "When you create an account with us, you must provide accurate, complete, and current information...",
        }),
      ],
      { cols: 1 }
    ),

    // Section 4
    section(
      "section4",
      "Section 4: Products and Pricing",
      [
        field.text("sections.3.title", "Title", {
          placeholder: "4. Products and Pricing",
        }),
        field.textarea("sections.3.content", "Content", {
          rows: 3,
          placeholder: "All products are subject to availability. We reserve the right to discontinue any product...",
        }),
      ],
      { cols: 1 }
    ),

    // Section 5
    section(
      "section5",
      "Section 5: Orders and Payment",
      [
        field.text("sections.4.title", "Title", {
          placeholder: "5. Orders and Payment",
        }),
        field.textarea("sections.4.content", "Content", {
          rows: 3,
          placeholder: "When you place an order, you are making an offer to purchase. We reserve the right to accept or decline...",
        }),
      ],
      { cols: 1 }
    ),

    // Section 6
    section(
      "section6",
      "Section 6: Shipping and Delivery",
      [
        field.text("sections.5.title", "Title", {
          placeholder: "6. Shipping and Delivery",
        }),
        field.textarea("sections.5.content", "Content", {
          rows: 3,
          placeholder: "Delivery times are estimates only and are not guaranteed...",
        }),
      ],
      { cols: 1 }
    ),

    // Section 7
    section(
      "section7",
      "Section 7: Returns and Refunds",
      [
        field.text("sections.6.title", "Title", {
          placeholder: "7. Returns and Refunds",
        }),
        field.textarea("sections.6.content", "Content", {
          rows: 3,
          placeholder: "Our return and refund policy is detailed on our Returns & Exchanges page...",
        }),
      ],
      { cols: 1 }
    ),

    // Section 8
    section(
      "section8",
      "Section 8: Intellectual Property",
      [
        field.text("sections.7.title", "Title", {
          placeholder: "8. Intellectual Property",
        }),
        field.textarea("sections.7.content", "Content", {
          rows: 3,
          placeholder: "All content on this website, including text, graphics, logos, images, and software...",
        }),
      ],
      { cols: 1 }
    ),

    // Section 9
    section(
      "section9",
      "Section 9: Limitation of Liability",
      [
        field.text("sections.8.title", "Title", {
          placeholder: "9. Limitation of Liability",
        }),
        field.textarea("sections.8.content", "Content", {
          rows: 3,
          placeholder: "BigBoss shall not be liable for any indirect, incidental, special, consequential...",
        }),
      ],
      { cols: 1 }
    ),

    // Section 10
    section(
      "section10",
      "Section 10: Indemnification",
      [
        field.text("sections.9.title", "Title", {
          placeholder: "10. Indemnification",
        }),
        field.textarea("sections.9.content", "Content", {
          rows: 3,
          placeholder: "You agree to indemnify and hold harmless BigBoss and its officers, directors...",
        }),
      ],
      { cols: 1 }
    ),

    // Section 11
    section(
      "section11",
      "Section 11: Changes to Terms",
      [
        field.text("sections.10.title", "Title", {
          placeholder: "11. Changes to Terms",
        }),
        field.textarea("sections.10.content", "Content", {
          rows: 3,
          placeholder: "We reserve the right to modify these terms at any time. Changes will be effective immediately...",
        }),
      ],
      { cols: 1 }
    ),

    // Section 12
    section(
      "section12",
      "Section 12: Governing Law",
      [
        field.text("sections.11.title", "Title", {
          placeholder: "12. Governing Law",
        }),
        field.textarea("sections.11.content", "Content", {
          rows: 3,
          placeholder: "These terms shall be governed by and construed in accordance with the laws of Bangladesh...",
        }),
      ],
      { cols: 1 }
    ),

    // Section 13 - Contact
    section(
      "section13",
      "Section 13: Contact Information",
      [
        field.text("sections.12.title", "Title", {
          placeholder: "13. Contact Information",
        }),
        field.textarea("sections.12.content", "Content", {
          rows: 2,
          placeholder: "For questions about these Terms of Service, please contact us:",
        }),
        field.email("sections.12.contact.email", "Contact Email", {
          placeholder: "legal@bigboss.com",
        }),
        field.text("sections.12.contact.phone", "Contact Phone", {
          placeholder: "+880 1XXX-XXXXXX",
        }),
        field.text("sections.12.contact.address", "Contact Address", {
          placeholder: "Dhaka, Bangladesh",
        }),
      ],
      { cols: 2 }
    ),
  ],
});
