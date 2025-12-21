import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";
import { getCmsPage } from "@/api/platform/cms-api";
import { cmsPages } from "@/lib/cms-data";
import type { PolicyPageContent } from "@/types/cms.types";

export const revalidate = 3600; // 1 hour

export const metadata = {
  title: "Terms & Conditions",
  description: "Read our terms of service and conditions for using our website.",
};

export default async function TermsPage() {
  let content = cmsPages.terms.content as PolicyPageContent;

  // Try to fetch from CMS, fall back to static data if not found
  try {
    const response = await getCmsPage({ slug: "terms-conditions" });
    if (response.success && response.data?.content) {
      content = response.data.content as unknown as PolicyPageContent;
    }
  } catch (error) {
    // Silently use static fallback data if CMS fetch fails
    console.log("Using static fallback data for terms page");
  }

  return (
    <Section padding="lg">
      <Container maxWidth="4xl">
        <h1 className="font-display text-4xl md:text-5xl mb-8">{content.title}</h1>

        <div className="prose prose-neutral max-w-none space-y-8">
          <p className="text-lg text-muted-foreground">Last updated: {content.lastUpdated}</p>

          {content.intro && (
            <p className="text-muted-foreground">{content.intro}</p>
          )}

          {content.sections?.map((section, index) => (
            <section key={index}>
              <h2 className="font-display text-2xl mb-4">{section.title}</h2>
              {section.content && <p className="text-muted-foreground mb-4">{section.content}</p>}
              {section.list && (
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  {section.list.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              )}
              {section.subsections && (
                <div className="space-y-4 ml-4">
                  {section.subsections.map((subsection, subIndex) => (
                    <div key={subIndex}>
                      <h3 className="font-semibold text-lg mb-2">{subsection.title}</h3>
                      <p className="text-muted-foreground">{subsection.content}</p>
                    </div>
                  ))}
                </div>
              )}
              {section.contact && (
                <p className="text-muted-foreground mt-4">
                  Email: {section.contact.email}<br />
                  Phone: {section.contact.phone}<br />
                  Address: {section.contact.address}
                </p>
              )}
            </section>
          ))}
        </div>
      </Container>
    </Section>
  );
}
