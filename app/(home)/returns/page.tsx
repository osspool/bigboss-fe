import { Section, Container } from "@classytic/clarity/layout";
import { Package, Clock, RefreshCw, CheckCircle, LucideIcon } from "lucide-react";
import { getCmsPage } from "@/lib/sdk";
import { cmsPages } from "@/lib/cms-data";
import type { ReturnsPageContent } from "@/types";

export const revalidate = 3600;

export const metadata = {
  title: "Returns & Refunds Policy",
  description: "Learn about our return and refund policy.",
};

const iconMap: Record<string, LucideIcon> = { Package, Clock, RefreshCw, CheckCircle };

export default async function ReturnsPage() {
  let content = cmsPages.returns.content as ReturnsPageContent;

  // Try to fetch from CMS, fall back to static data if not found
  try {
    const response = await getCmsPage({ slug: "returns-refunds" });
    if (response.success && response.data?.content) {
      content = response.data.content as unknown as ReturnsPageContent;
    }
  } catch (error) {
    // Silently use static fallback data if CMS fetch fails
    console.log("Using static fallback data for returns page");
  }

  return (
    <Section padding="lg">
      <Container maxWidth="4xl">
        <h1 className="font-display text-4xl md:text-5xl mb-4">{content.title}</h1>
        <p className="text-lg text-muted-foreground mb-12">{content.subtitle}</p>

        {/* Process Steps */}
        {content.steps && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {content.steps.map((step, index) => {
              const Icon = iconMap[step.icon] || Package;
              return (
                <div key={step.title} className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-muted flex items-center justify-center">
                    <Icon className="h-8 w-8" />
                  </div>
                  <div className="text-xs text-muted-foreground mb-2">Step {index + 1}</div>
                  <h3 className="font-medium mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              );
            })}
          </div>
        )}

        <div className="space-y-12">
          {content.sections?.map((section, index) => {
            if (section.type === "policy") {
              return (
                <section key={index}>
                  <h2 className="font-display text-2xl mb-4">{section.title}</h2>
                  <div className="bg-muted p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-1 h-full bg-foreground" />
                      <div>
                        <h3 className="font-medium mb-2">{section.highlight?.title}</h3>
                        <p className="text-muted-foreground">{section.highlight?.content}</p>
                      </div>
                    </div>
                  </div>
                </section>
              );
            }

            if (section.type === "grid") {
              return (
                <section key={index}>
                  <h2 className="font-display text-2xl mb-4">{section.title}</h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    {section.columns?.map((column, colIndex) => (
                      <div key={colIndex} className="border border-border p-6">
                        <h3 className={`font-medium mb-4 ${column.variant === "success" ? "text-green-600" : "text-destructive"}`}>
                          {column.title}
                        </h3>
                        <ul className="space-y-2 text-muted-foreground">
                          {column.items.map((item, itemIndex) => <li key={itemIndex}>• {item}</li>)}
                        </ul>
                      </div>
                    ))}
                  </div>
                </section>
              );
            }

            if (section.type === "text") {
              return (
                <section key={index}>
                  <h2 className="font-display text-2xl mb-4">{section.title}</h2>
                  {section.content && <p className="text-muted-foreground mb-4">{section.content}</p>}
                  {section.paragraphs && (
                    <div className="space-y-4 text-muted-foreground">
                      {section.paragraphs.map((para, paraIndex) => (
                        <p key={paraIndex}>
                          {typeof para === "string" ? para : (
                            <><strong className="text-foreground">{para.text}</strong>{para.suffix}</>
                          )}
                        </p>
                      ))}
                    </div>
                  )}
                  {section.list && (
                    <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                      {section.list.map((item, itemIndex) => <li key={itemIndex}>{item}</li>)}
                    </ul>
                  )}
                  {section.footer && <p className="text-muted-foreground mt-4">{section.footer}</p>}
                </section>
              );
            }

            return null;
          })}

          {/* Contact Section */}
          {content.contactSection && (
            <section className="bg-primary text-primary-foreground p-8">
              <h2 className="font-display text-2xl mb-4">{content.contactSection.title}</h2>
              <p className="mb-4">{content.contactSection.content}</p>
              <p>
                Email: {content.contactSection.email}<br />
                Phone: {content.contactSection.phone}<br />
                Hours: {content.contactSection.hours}
              </p>
            </section>
          )}
        </div>
      </Container>
    </Section>
  );
}
