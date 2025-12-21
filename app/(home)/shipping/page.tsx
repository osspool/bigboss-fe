import { Zap, Truck, Gift, LucideIcon } from "lucide-react";
import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";
import { getCmsPage } from "@/api/platform/cms-api";
import { cmsPages } from "@/lib/cms-data";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { ShippingPageContent } from "@/types/cms.types";

export const revalidate = 3600;

export const metadata = {
  title: "Shipping & Delivery",
  description: "Learn about our shipping options, delivery times, and how to track your order.",
};

const iconMap: Record<string, LucideIcon> = { Zap, Truck, Gift };

export default async function ShippingPage() {
  let content = cmsPages.shipping.content as ShippingPageContent;

  // Try to fetch from CMS, fall back to static data if not found
  try {
    const response = await getCmsPage({ slug: "shipping-delivery" });
    if (response.success && response.data?.content) {
      content = response.data.content as unknown as ShippingPageContent;
    }
  } catch (error) {
    // Silently use static fallback data if CMS fetch fails
    console.log("Using static fallback data for shipping page");
  }

  return (
    <>
      {/* Header */}
      <Section padding="lg" background="muted">
        <Container>
          <div className="text-center max-w-2xl mx-auto">
            <h1 className="font-display text-4xl md:text-5xl mb-4">{content.title}</h1>
            <p className="text-lg text-muted-foreground">{content.subtitle}</p>
          </div>
        </Container>
      </Section>

      {/* Delivery Methods */}
      <Section padding="lg">
        <Container>
          <div className="grid md:grid-cols-3 gap-6">
            {content.deliveryMethods?.map((method, index) => {
              const Icon = iconMap[method.icon] || Truck;
              return (
                <div key={index} className="border border-border p-6 text-center">
                  <div className="w-14 h-14 mx-auto mb-4 bg-primary text-primary-foreground flex items-center justify-center">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-display text-xl mb-2">{method.name}</h3>
                  <div className="text-2xl font-bold text-primary mb-2">{method.price}</div>
                  <div className="text-sm text-muted-foreground mb-3">{method.duration}</div>
                  <p className="text-sm text-muted-foreground">{method.description}</p>
                </div>
              );
            })}
          </div>
        </Container>
      </Section>

      {/* Delivery Areas */}
      {content.deliveryAreas && (
        <Section padding="lg" background="muted">
          <Container>
            <h2 className="font-display text-2xl md:text-3xl mb-8 text-center">
              {content.deliveryAreas.title}
            </h2>
            <div className="max-w-2xl mx-auto">
              <div className="bg-background border border-border overflow-hidden">
                <div className="grid grid-cols-3 gap-4 p-4 bg-muted font-medium">
                  <div>Location</div>
                  <div>Delivery Time</div>
                  <div>Cost</div>
                </div>
                {content.deliveryAreas.areas?.map((area, index) => (
                  <div key={index} className="grid grid-cols-3 gap-4 p-4 border-t border-border">
                    <div className="font-medium">{area.name}</div>
                    <div className="text-muted-foreground">{area.duration}</div>
                    <div className="text-muted-foreground">{area.cost}</div>
                  </div>
                ))}
              </div>
            </div>
          </Container>
        </Section>
      )}

      {/* Order Tracking */}
      {content.orderTracking && (
        <Section padding="lg">
          <Container>
            <div className="max-w-3xl mx-auto">
              <h2 className="font-display text-2xl md:text-3xl mb-4 text-center">
                {content.orderTracking.title}
              </h2>
              <p className="text-muted-foreground text-center mb-8">
                {content.orderTracking.description}
              </p>
              <div className="space-y-4">
                {content.orderTracking.steps?.map((step, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-medium">{step.title}</h4>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Container>
        </Section>
      )}

      {/* Policies */}
      {content.policies && content.policies.length > 0 && (
        <Section padding="lg" background="muted">
          <Container>
            <h2 className="font-display text-2xl md:text-3xl mb-8 text-center">
              Shipping Policies
            </h2>
            <div className="max-w-3xl mx-auto space-y-6">
              {content.policies.map((policy, index) => (
                <div key={index} className="bg-background p-6 border border-border">
                  <h3 className="font-display text-lg mb-3">{policy.title}</h3>
                  <p className="text-muted-foreground">{policy.content}</p>
                  {policy.list && (
                    <ul className="mt-4 list-disc pl-6 text-muted-foreground space-y-1">
                      {policy.list.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </Container>
        </Section>
      )}

      {/* FAQ */}
      {content.faq && content.faq.length > 0 && (
        <Section padding="lg">
          <Container>
            <h2 className="font-display text-2xl md:text-3xl mb-8 text-center">
              Frequently Asked Questions
            </h2>
            <div className="max-w-2xl mx-auto">
              <Accordion type="single" collapsible className="space-y-4">
                {content.faq.map((item, index) => (
                  <AccordionItem key={index} value={`faq-${index}`} className="border rounded-lg px-6">
                    <AccordionTrigger className="text-left hover:no-underline">
                      <span className="font-semibold">{item.question}</span>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </Container>
        </Section>
      )}

      {/* Contact Section */}
      {content.contactSection && (
        <Section padding="lg" className="bg-primary text-primary-foreground">
          <Container>
            <div className="text-center max-w-xl mx-auto">
              <h2 className="font-display text-2xl md:text-3xl mb-4">
                {content.contactSection.title}
              </h2>
              <p className="text-primary-foreground/80 mb-6">
                {content.contactSection.description}
              </p>
              <div className="space-y-2">
                <p>Email: {content.contactSection.email}</p>
                <p>Phone: {content.contactSection.phone}</p>
                <p>Hours: {content.contactSection.hours}</p>
              </div>
            </div>
          </Container>
        </Section>
      )}
    </>
  );
}
