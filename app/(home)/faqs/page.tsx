import { getCmsPage } from "@/lib/sdk";
import { cmsPages } from "@/lib/cms-data";
import { Section, Container } from "@classytic/clarity/layout";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { FAQPageContent } from "@/types";

export const revalidate = 1800; // 30 minutes

export const metadata = {
  title: "FAQs - Frequently Asked Questions",
  description: "Find answers to commonly asked questions about our products, shipping, returns, and more.",
};

export default async function FAQsPage() {
  let content = cmsPages.faq.content as FAQPageContent;

  // Try to fetch from CMS, fall back to static data if not found
  try {
    const response = await getCmsPage({ slug: "faqs" });
    if (response.success && response.data?.content) {
      content = response.data.content as unknown as FAQPageContent;
    }
  } catch (error) {
    // Silently use static fallback data if CMS fetch fails
    console.log("Using static fallback data for FAQs page");
  }

  return (
    <div className="min-h-screen">
      <Section padding="xl">
        <Container className="max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl mb-4">{content.title}</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{content.subtitle}</p>
          </div>

          {/* FAQs by Category */}
          {content.categories?.map((category, categoryIdx) => (
            <div key={categoryIdx} className="mb-12">
              <h2 className="text-2xl font-bold mb-6">{category.title}</h2>
              <Accordion type="single" collapsible className="space-y-4">
                {category.items?.map((faq, idx) => (
                  <AccordionItem key={idx} value={`item-${categoryIdx}-${idx}`} className="border rounded-lg px-6">
                    <AccordionTrigger className="text-left hover:no-underline">
                      <span className="font-semibold">{faq.question}</span>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}

          {/* Contact CTA */}
          {content.contactSection && (
            <div className="mt-16 text-center p-8 bg-muted rounded-lg">
              <h3 className="text-2xl font-bold mb-2">{content.contactSection.title}</h3>
              <p className="text-muted-foreground mb-4">{content.contactSection.description}</p>
              <a
                href="/contact"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6 py-2"
              >
                Contact Support
              </a>
            </div>
          )}
        </Container>
      </Section>
    </div>
  );
}
