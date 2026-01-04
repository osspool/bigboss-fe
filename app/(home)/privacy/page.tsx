import { Section, Container } from "@classytic/clarity/layout";
import { getCmsPage } from "@/lib/sdk";
import { cmsPages } from "@/lib/cms-data";
import type { PolicyPageContent } from "@/types";

export const revalidate = 3600; // 1 hour

export const metadata = {
  title: "Privacy Policy",
  description: "Our privacy policy and how we handle your data.",
};

export default async function PrivacyPage() {
  let content = cmsPages.privacy.content as PolicyPageContent;

  // Try to fetch from CMS, fall back to static data if not found
  try {
    const response = await getCmsPage({ slug: "privacy-policy" });
    if (response.success && response.data?.content) {
      content = response.data.content as unknown as PolicyPageContent;
    }
  } catch (error) {
    // Silently use static fallback data if CMS fetch fails
    console.log("Using static fallback data for privacy page");
  }

  return (
    <Section padding="lg">
      <Container maxWidth="4xl">
        <h1 className="font-display text-4xl md:text-5xl mb-8">{content.title}</h1>
        
        <div className="prose prose-neutral max-w-none space-y-8">
          <p className="text-lg text-muted-foreground">Last updated: {content.lastUpdated}</p>

          {content.sections?.map((section, index) => (
            <section key={index}>
              <h2 className="font-display text-2xl mb-4">{section.title}</h2>
              {section.content && <p className="text-muted-foreground mb-4">{section.content}</p>}
              {section.list && (
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  {section.list.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
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
