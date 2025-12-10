import { field, section } from "@/components/form/form-system";

/**
 * Privacy/Terms/Cookies Page Form Schema
 * Matches PolicyPageContent in types/cms.types.ts
 */
export const privacyPageSchema = () => ({
  sections: [
    // Header
    section(
      "header",
      "Page Header",
      [
        field.text("title", "Page Title", {
          required: true,
          placeholder: "Privacy Policy",
        }),
        field.text("lastUpdated", "Last Updated", {
          required: true,
          placeholder: "December 2024",
        }),
      ],
      { cols: 2 }
    ),

    // Section 1
    section(
      "section1",
      "Section 1",
      [
        field.text("sections.0.title", "Title", {
          placeholder: "1. Information We Collect",
        }),
        field.textarea("sections.0.content", "Content", {
          rows: 3,
          placeholder: "At BigBoss, we collect information you provide directly to us, including:",
        }),
        field.text("sections.0.list.0", "List Item 1", {
          placeholder: "Name, email address, and phone number...",
        }),
        field.text("sections.0.list.1", "List Item 2", {
          placeholder: "Shipping and billing address...",
        }),
        field.text("sections.0.list.2", "List Item 3", {
          placeholder: "Payment information...",
        }),
        field.text("sections.0.list.3", "List Item 4", {
          placeholder: "Communication preferences...",
        }),
        field.text("sections.0.list.4", "List Item 5", {
          placeholder: "Product reviews and feedback...",
        }),
      ],
      { cols: 1 }
    ),

    // Section 2
    section(
      "section2",
      "Section 2",
      [
        field.text("sections.1.title", "Title", {
          placeholder: "2. How We Use Your Information",
        }),
        field.textarea("sections.1.content", "Content", {
          rows: 2,
          placeholder: "We use the information we collect to:",
        }),
        field.text("sections.1.list.0", "List Item 1", {
          placeholder: "Process and fulfill your orders",
        }),
        field.text("sections.1.list.1", "List Item 2", {
          placeholder: "Send order confirmations and shipping updates",
        }),
        field.text("sections.1.list.2", "List Item 3", {
          placeholder: "Respond to your inquiries...",
        }),
        field.text("sections.1.list.3", "List Item 4", {
          placeholder: "Send promotional communications...",
        }),
        field.text("sections.1.list.4", "List Item 5", {
          placeholder: "Improve our products and services...",
        }),
        field.text("sections.1.list.5", "List Item 6", {
          placeholder: "Prevent fraud and enhance security",
        }),
      ],
      { cols: 1 }
    ),

    // Section 3
    section(
      "section3",
      "Section 3",
      [
        field.text("sections.2.title", "Title", {
          placeholder: "3. Information Sharing",
        }),
        field.textarea("sections.2.content", "Content", {
          rows: 2,
          placeholder: "We do not sell your personal information. We may share your information with:",
        }),
        field.text("sections.2.list.0", "List Item 1", {
          placeholder: "Shipping carriers to deliver your orders",
        }),
        field.text("sections.2.list.1", "List Item 2", {
          placeholder: "Payment processors to complete transactions",
        }),
        field.text("sections.2.list.2", "List Item 3", {
          placeholder: "Service providers who assist our operations",
        }),
        field.text("sections.2.list.3", "List Item 4", {
          placeholder: "Law enforcement when required by law",
        }),
      ],
      { cols: 1 }
    ),

    // Section 4
    section(
      "section4",
      "Section 4",
      [
        field.text("sections.3.title", "Title", {
          placeholder: "4. Data Security",
        }),
        field.textarea("sections.3.content", "Content", {
          rows: 3,
          placeholder: "We implement appropriate security measures to protect your personal information...",
        }),
      ],
      { cols: 1 }
    ),

    // Section 5
    section(
      "section5",
      "Section 5",
      [
        field.text("sections.4.title", "Title", {
          placeholder: "5. Your Rights",
        }),
        field.textarea("sections.4.content", "Content", {
          rows: 2,
          placeholder: "You have the right to:",
        }),
        field.text("sections.4.list.0", "List Item 1", {
          placeholder: "Access and review your personal information",
        }),
        field.text("sections.4.list.1", "List Item 2", {
          placeholder: "Update or correct inaccurate information",
        }),
        field.text("sections.4.list.2", "List Item 3", {
          placeholder: "Request deletion of your personal data",
        }),
        field.text("sections.4.list.3", "List Item 4", {
          placeholder: "Opt-out of marketing communications",
        }),
        field.text("sections.4.list.4", "List Item 5", {
          placeholder: "Data portability upon request",
        }),
      ],
      { cols: 1 }
    ),

    // Section 6
    section(
      "section6",
      "Section 6",
      [
        field.text("sections.5.title", "Title", {
          placeholder: "6. Cookies",
        }),
        field.textarea("sections.5.content", "Content", {
          rows: 3,
          placeholder: "We use cookies and similar technologies to enhance your browsing experience...",
        }),
      ],
      { cols: 1 }
    ),

    // Section 7 - Contact
    section(
      "section7",
      "Section 7 - Contact",
      [
        field.text("sections.6.title", "Title", {
          placeholder: "7. Contact Us",
        }),
        field.textarea("sections.6.content", "Content", {
          rows: 2,
          placeholder: "If you have questions about this Privacy Policy, please contact us at:",
        }),
        field.email("sections.6.contact.email", "Contact Email", {
          placeholder: "privacy@bigboss.com",
        }),
        field.text("sections.6.contact.phone", "Contact Phone", {
          placeholder: "+880 1XXX-XXXXXX",
        }),
        field.text("sections.6.contact.address", "Contact Address", {
          placeholder: "Dhaka, Bangladesh",
        }),
      ],
      { cols: 2 }
    ),
  ],
});
