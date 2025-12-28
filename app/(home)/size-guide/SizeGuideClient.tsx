"use client";

import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";
import { SizeTable } from "@/feature/size-guide";
import { SIZE_GUIDE } from "@/data/constants";
import { useSizeGuideContext } from "@/contexts/SizeGuideContext";
import { Spinner } from "@/components/ui/spinner";

export function SizeGuideClient() {
  const { sizeTables: staticSizeTables, fitTypes, tips } = SIZE_GUIDE;

  // Try to get dynamic size guides from context
  let dynamicTables = null;
  let isLoading = false;
  let hasApiData = false;

  try {
    const context = useSizeGuideContext();
    isLoading = context.isLoading;

    if (context.sizeGuides.length > 0) {
      dynamicTables = context.toTableDataArray(context.sizeGuides);
      hasApiData = true;
    }
  } catch {
    // Context not available, will use static data
  }

  // Use API data if available, otherwise fallback to static data
  const sizeTables = hasApiData && dynamicTables ? dynamicTables : staticSizeTables;

  return (
    <>
      {/* Size Tables */}
      <Section padding="xl" background="muted">
        <Container>
          <h2 className="font-display text-2xl md:text-3xl mb-8 text-center">
            Size Charts
          </h2>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner className="h-8 w-8" />
            </div>
          ) : (
            <SizeTable tables={[...sizeTables]} />
          )}
        </Container>
      </Section>

      {/* Fit Types */}
      <Section padding="xl">
        <Container maxWidth="4xl">
          <h2 className="font-display text-2xl md:text-3xl mb-8 text-center">
            {fitTypes.title}
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {fitTypes.types.map((fit, index) => (
              <div key={index} className="border border-border rounded-lg p-6">
                <h3 className="font-display text-xl mb-2">{fit.name}</h3>
                <p className="text-muted-foreground mb-4">{fit.description}</p>
                <p className="text-sm bg-muted rounded-md p-3">
                  <strong>Tip:</strong> {fit.recommendation}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Sizing Tips */}
      <Section padding="lg" background="muted">
        <Container maxWidth="4xl">
          <h2 className="font-display text-2xl md:text-3xl mb-6 text-center">
            {tips.title}
          </h2>
          <ul className="space-y-3 max-w-2xl mx-auto">
            {tips.items.map((tip, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="w-6 h-6 bg-foreground text-background rounded-full flex items-center justify-center text-sm shrink-0">
                  {index + 1}
                </span>
                <span className="text-muted-foreground">{tip}</span>
              </li>
            ))}
          </ul>
        </Container>
      </Section>
    </>
  );
}
