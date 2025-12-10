import { Ruler, Mail, Phone } from "lucide-react";
import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";
import { getCmsPage } from "@/api/platform/cms-api";
import { cmsPages } from "@/lib/cms-data";
import { SizeGuideClient } from "./SizeGuideClient";
import type { SizeGuidePageContent } from "@/types/cms.types";

export const revalidate = 3600;

export const metadata = {
  title: "Size Guide - Find Your Perfect Fit",
  description: "Use our comprehensive size guide to find your perfect fit.",
};

export default async function SizeGuidePage() {
  let content = cmsPages.sizeGuide.content as SizeGuidePageContent;

  // Try to fetch from CMS, fall back to static data if not found
  try {
    const response = await getCmsPage({ slug: "size-guide" });
    if (response.success && response.data?.content) {
      content = response.data.content as unknown as SizeGuidePageContent;
    }
  } catch (error) {
    // Silently use static fallback data if CMS fetch fails
    console.log("Using static fallback data for size guide page");
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

      {/* How to Measure */}
      <Section padding="lg">
        <Container>
          <h2 className="font-display text-2xl md:text-3xl mb-4 text-center">{content.howToMeasure?.title}</h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-8">{content.howToMeasure?.description}</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {content.howToMeasure?.measurements?.map((measurement, index) => (
              <div key={index} className="bg-muted p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-primary text-primary-foreground flex items-center justify-center">
                  <Ruler className="h-5 w-5" />
                </div>
                <h3 className="font-display text-lg mb-2">{measurement.name}</h3>
                <p className="text-sm text-muted-foreground">{measurement.instruction}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Size Tables */}
      <SizeGuideClient content={content} />

      {/* Help Section */}
      {content.helpSection && (
        <Section padding="lg" className="bg-primary text-primary-foreground">
          <Container>
            <div className="text-center max-w-xl mx-auto">
              <h2 className="font-display text-2xl md:text-3xl mb-4">{content.helpSection.title}</h2>
              <p className="text-primary-foreground/80 mb-6">{content.helpSection.description}</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <a href={`mailto:${content.helpSection.email}`} className="flex items-center gap-2 hover:underline">
                  <Mail className="h-5 w-5" />
                  {content.helpSection.email}
                </a>
                <a href={`tel:${content.helpSection.phone}`} className="flex items-center gap-2 hover:underline">
                  <Phone className="h-5 w-5" />
                  {content.helpSection.phone}
                </a>
              </div>
            </div>
          </Container>
        </Section>
      )}
    </>
  );
}
