"use client";

import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface SizeGuideClientProps {
  content: any;
}

export function SizeGuideClient({ content }: SizeGuideClientProps) {
  if (!content.sizeTables || content.sizeTables.length === 0) {
    return null;
  }

  return (
    <>
      {/* Size Tables */}
      <Section padding="xl" background="muted">
        <Container>
          <h2 className="font-display text-2xl md:text-3xl mb-8 text-center">
            Size Charts
          </h2>
          <Tabs defaultValue={content.sizeTables[0].category} className="w-full">
            <TabsList className="flex flex-wrap justify-center gap-2 h-auto bg-transparent mb-8">
              {content.sizeTables.map((table: any) => (
                <TabsTrigger
                  key={table.category}
                  value={table.category}
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-2 border border-border"
                >
                  {table.category}
                </TabsTrigger>
              ))}
            </TabsList>
            {content.sizeTables.map((table: any) => (
              <TabsContent key={table.category} value={table.category}>
                <div className="bg-background border border-border p-6">
                  <p className="text-muted-foreground mb-6 text-center">
                    {table.description}
                  </p>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted">
                          {table.headers.map((header: string, index: number) => (
                            <TableHead
                              key={index}
                              className={index === 0 ? "font-display" : "text-center"}
                            >
                              {header}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {table.rows.map((row: string[], rowIndex: number) => (
                          <TableRow key={rowIndex}>
                            {row.map((cell: string, cellIndex: number) => (
                              <TableCell
                                key={cellIndex}
                                className={cellIndex === 0 ? "font-medium" : "text-center text-muted-foreground"}
                              >
                                {cell}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </Container>
      </Section>

      {/* Fit Types */}
      {content.fitTypes && (
        <Section padding="xl">
          <Container maxWidth="4xl">
            <h2 className="font-display text-2xl md:text-3xl mb-8 text-center">
              {content.fitTypes.title}
            </h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {content.fitTypes.types?.map((fit: any, index: number) => (
                <div key={index} className="border border-border p-6">
                  <h3 className="font-display text-xl mb-2">{fit.name}</h3>
                  <p className="text-muted-foreground mb-4">{fit.description}</p>
                  <p className="text-sm bg-muted p-3">
                    <strong>Tip:</strong> {fit.recommendation}
                  </p>
                </div>
              ))}
            </div>
          </Container>
        </Section>
      )}

      {/* Sizing Tips */}
      {content.tips && (
        <Section padding="lg" background="muted">
          <Container maxWidth="4xl">
            <h2 className="font-display text-2xl md:text-3xl mb-6 text-center">
              {content.tips.title}
            </h2>
            <ul className="space-y-3 max-w-2xl mx-auto">
              {content.tips.items?.map((tip: string, index: number) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-primary text-primary-foreground flex items-center justify-center text-sm flex-shrink-0">
                    {index + 1}
                  </span>
                  <span className="text-muted-foreground">{tip}</span>
                </li>
              ))}
            </ul>
          </Container>
        </Section>
      )}
    </>
  );
}
