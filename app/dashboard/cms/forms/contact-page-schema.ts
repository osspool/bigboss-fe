import { field, section } from "@/components/form/form-system";

/**
 * Contact Page Form Schema
 * Matches ContactPageContent in types/cms.types.ts
 *
 * Improved design with:
 * - Clear section grouping
 * - Descriptive field labels
 * - Better visual organization
 */
export const contactPageSchema = () => ({
  sections: [
    // Header Section
    section(
      "header",
      "Page Header",
      [
        field.text("title", "Page Title", {
          required: true,
          placeholder: "Get In Touch",
        }),
        field.textarea("subtitle", "Subtitle", {
          rows: 2,
          placeholder: "Have a question or feedback? We'd love to hear from you. Reach out through any of the channels below.",
          fullWidth: true,
        }),
      ],
      { cols: 1 }
    ),

    // Contact Info Cards - Visit Us (MapPin Icon)
    section(
      "contactInfo_visit",
      "📍 Visit Us Card",
      [
        field.text("contactInfo.0.title", "Card Title", {
          placeholder: "Visit Us",
        }),
        field.text("contactInfo.0.lines.0", "Line 1 - Building Name", {
          placeholder: "BigBoss Headquarters",
        }),
        field.text("contactInfo.0.lines.1", "Line 2 - Street Address", {
          placeholder: "House 42, Road 11, Block E",
        }),
        field.text("contactInfo.0.lines.2", "Line 3 - City & Postal", {
          placeholder: "Banani, Dhaka 1213",
        }),
        field.text("contactInfo.0.lines.3", "Line 4 - Country", {
          placeholder: "Bangladesh",
        }),
      ],
      { cols: 2 }
    ),

    // Contact Info Cards - Call Us (Phone Icon)
    section(
      "contactInfo_call",
      "📞 Call Us Card",
      [
        field.text("contactInfo.1.title", "Card Title", {
          placeholder: "Call Us",
        }),
        field.text("contactInfo.1.lines.0", "Line 1 - Primary Phone", {
          placeholder: "+880 1XXX-XXXXXX",
        }),
        field.text("contactInfo.1.lines.1", "Line 2 - Secondary Phone", {
          placeholder: "+880 1XXX-XXXXXX",
        }),
        field.text("contactInfo.1.lines.2", "Line 3 - Working Days", {
          placeholder: "Sunday - Thursday",
        }),
        field.text("contactInfo.1.lines.3", "Line 4 - Working Hours", {
          placeholder: "10:00 AM - 6:00 PM BST",
        }),
      ],
      { cols: 2 }
    ),

    // Contact Info Cards - Email Us (Mail Icon)
    section(
      "contactInfo_email",
      "📧 Email Us Card",
      [
        field.text("contactInfo.2.title", "Card Title", {
          placeholder: "Email Us",
        }),
        field.text("contactInfo.2.lines.0", "Line 1 - General Email", {
          placeholder: "General: hello@bigboss.com",
        }),
        field.text("contactInfo.2.lines.1", "Line 2 - Support Email", {
          placeholder: "Support: support@bigboss.com",
        }),
        field.text("contactInfo.2.lines.2", "Line 3 - Press Email", {
          placeholder: "Press: press@bigboss.com",
        }),
        field.text("contactInfo.2.lines.3", "Line 4 - Careers Email", {
          placeholder: "Careers: careers@bigboss.com",
        }),
      ],
      { cols: 2 }
    ),

    // Contact Form Settings
    section(
      "form",
      "Contact Form Configuration",
      [
        field.text("form.title", "Form Title", {
          placeholder: "Send Us a Message",
        }),
        field.textarea("form.description", "Form Description", {
          rows: 2,
          placeholder: "Fill out the form below and we'll get back to you within 24 hours.",
          fullWidth: true,
        }),
        field.text("form.submitText", "Submit Button Text", {
          placeholder: "Send Message",
        }),
      ],
      { cols: 1 }
    ),

    // Social Links - Instagram
    section(
      "socials_instagram",
      "Instagram",
      [
        field.text("socials.0.platform", "Platform Name", {
          placeholder: "Instagram",
        }),
        field.text("socials.0.handle", "Handle", {
          placeholder: "@bigboss.bd",
        }),
        field.url("socials.0.url", "Profile URL", {
          placeholder: "https://instagram.com/bigboss.bd",
        }),
      ],
      { cols: 3 }
    ),

    // Social Links - Facebook
    section(
      "socials_facebook",
      "Facebook",
      [
        field.text("socials.1.platform", "Platform Name", {
          placeholder: "Facebook",
        }),
        field.text("socials.1.handle", "Handle", {
          placeholder: "/bigbossbd",
        }),
        field.url("socials.1.url", "Profile URL", {
          placeholder: "https://facebook.com/bigbossbd",
        }),
      ],
      { cols: 3 }
    ),

    // Social Links - Twitter
    section(
      "socials_twitter",
      "Twitter / X",
      [
        field.text("socials.2.platform", "Platform Name", {
          placeholder: "Twitter",
        }),
        field.text("socials.2.handle", "Handle", {
          placeholder: "@bigboss_bd",
        }),
        field.url("socials.2.url", "Profile URL", {
          placeholder: "https://twitter.com/bigboss_bd",
        }),
      ],
      { cols: 3 }
    ),

    // Social Section Header
    section(
      "socials_header",
      "Social Media Section",
      [
        field.text("socialTitle", "Section Title", {
          placeholder: "Connect With Us",
        }),
      ],
      { cols: 1 }
    ),

    // FAQ Link Section
    section(
      "faq",
      "FAQ Section",
      [
        field.text("faq.title", "Section Title", {
          placeholder: "Quick Answers",
        }),
        field.textarea("faq.description", "Description", {
          rows: 2,
          placeholder: "Check our FAQ for instant answers to common questions.",
        }),
        field.text("faq.link", "FAQ Page Link", {
          placeholder: "/faqs",
        }),
        field.text("faq.linkText", "Link Text", {
          placeholder: "Visit FAQ Page",
        }),
      ],
      { cols: 2 }
    ),

    // Map Section
    section(
      "map",
      "Location Map",
      [
        field.text("map.title", "Map Section Title", {
          placeholder: "Find Us",
        }),
        field.url("map.embedUrl", "Google Maps Embed URL", {
          placeholder: "https://www.google.com/maps/embed?pb=...",
          description: "Get embed URL from Google Maps > Share > Embed a map",
          fullWidth: true,
        }),
      ],
      { cols: 1 }
    ),
  ],
});
